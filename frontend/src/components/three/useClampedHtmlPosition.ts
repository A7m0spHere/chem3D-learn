import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Camera, Object3D, WebGLRenderer } from "three";
import { Raycaster, Vector2, Vector3 } from "three";

// ---------------------------------------------------------------------------
// 屏幕空间钳制 + 同画布碰撞分离 + 深度淡出的 Html 位置/可见性计算
// （T-042，决策见 DECISIONS D-050）。
//
// 背景：drei <Html> 的 DOM 层永远画在 3D 画布之上——相机旋转后标签即使转到
// 结构后方仍浮在前面原子之上；pill 靠近画布边缘时被裁掉一半；同一场景多个
// 标签投影后可能叠印（MOF-5「虚线末端」）。
//
// 三个能力（都只在必要时改变渲染，默认视角逐像素不变）：
//   1. 钳制：覆盖 <Html calculatePosition>，用 pill 实测半宽/半高（ResizeObserver
//      写入 ref，不触发渲染）把中心点限制在画布内边距内。
//   2. 分离（需 collisionGroup）：同画布同组标签单次 O(n²) 相交检测，沿 y 推开
//      自己（后计算者让先计算者），限 maxPush 防止推飞。
//   3. 重叠淡出（需 fadeTo 且组件调用 markScreenRect）：useFrame 里对 pill 屏幕
//      矩形采 9 个射线，≥minCovered 个命中非线几何（无论远近）即判定 pill 压在
//      模型上，淡到 fadeTo 让模型透出——同时覆盖「近侧 pill 盖模型」与「标签转到
//      结构后方仍浮在最上层」两类遮挡。不用 drei occlude：blending 会劫持 canvas
//      z-index 并把内容缩放成纹理，raycast 是二元 display:none 且无法排除引线。
//
// 已知取舍：钳制/分离后 pill 微移而引线端仍指向 3D 锚点，出界场景线头可能
// 落在 pill 边缘附近；引线改屏幕空间绘制不在本轮范围。
// ---------------------------------------------------------------------------

type HtmlScreenSize = { width: number; height: number };

type RegisteredRect = {
  x: number;
  y: number;
  hw: number;
  hh: number;
};

// 按 renderer（即画布）分 registry，避免多画布互相干扰
const registries = new WeakMap<WebGLRenderer, Map<number, RegisteredRect>>();
let nextRectId = 1;

const worldPosition = new Vector3();
const screenPoint = new Vector2();
const raycaster = new Raycaster();

// pill 矩形 9 点采样（中心 + 四角 + 四边中点），0.85 内收缩避免边框掠射误判
const RECT_SAMPLES: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85],
  [-0.85, 0], [0.85, 0], [0, -0.85], [0, 0.85],
];

// drei Line（Line2 / LineSegments2）与原生 Line 统一按线类排除
function isLineLike(object: Object3D): boolean {
  return object.type === "Line" || object.type === "Line2" || object.type === "LineSegments2";
}

export type ClampedHtmlPosition = {
  /** 挂到 Html children 的包裹元素上：实测 pill 尺寸 + 淡出作用目标 */
  measureRef: (element: HTMLDivElement | null) => void;
  /** 传给 <Html calculatePosition> */
  calculatePosition: (
    object: Object3D,
    camera: Camera,
    size: HtmlScreenSize,
  ) => [number, number];
};

export function useClampedHtmlPosition(options?: {
  /** 距画布内边的最小留白（px），默认 8 */
  padding?: number;
  /** 碰撞分离分组：同画布同组的标签互相避让；不传则只钳制不分离 */
  collisionGroup?: string;
  /** 分离单方向最大推移（px），默认 72，超出则保持叠印不推飞 */
  maxPush?: number;
  /** 传入（如 0.3）启用重叠淡出：pill 矩形 ≥minCovered 个采样命中模型时
      半透明让模型透出。默认不启用——会误伤刻意贴原子布置的教学标签 */
  fadeTo?: number;
  /** 判定压模所需的最少命中采样数（9 点中），默认 3——刻意贴原子布置的
      教学标签（如密堆积配位视图）在球体间隙里只命中 1-2 点，不应误判 */
  minCovered?: number;
}): ClampedHtmlPosition {
  const gl = useThree((state) => state.gl);
  const padding = options?.padding ?? 8;
  const collisionGroup = options?.collisionGroup;
  const maxPush = options?.maxPush ?? 72;
  const fadeTo = options?.fadeTo ?? 0.3;
  const minCovered = options?.minCovered ?? 3;

  const halfWidthRef = useRef(0);
  const halfHeightRef = useRef(0);
  const rectIdRef = useRef(-1);
  const observerRef = useRef<ResizeObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  // calculatePosition 每帧写入的最终屏幕矩形，供淡出采样使用
  const screenRectRef = useRef({ x: 0, y: 0, hw: 0, hh: 0 });

  const applyOpacity = useCallback((element: HTMLDivElement, opacity: number) => {
    if (element.style.transition === "") element.style.transition = "opacity 200ms ease";
    const current = parseFloat(element.style.opacity || "1");
    if (Math.abs(current - opacity) > 0.01) element.style.opacity = String(opacity);
  }, []);

  const measureRef = useCallback(
    (element: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      elementRef.current = element;
      if (!element) return;
      const update = () => {
        const rect = element.getBoundingClientRect();
        halfWidthRef.current = rect.width / 2;
        halfHeightRef.current = rect.height / 2;
      };
      update();
      const observer = new ResizeObserver(update);
      observer.observe(element);
      observerRef.current = observer;
    },
    [],
  );

  // 卸载时清理 registry，防止残留 rect 参与后续分离
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      elementRef.current = null;
      if (rectIdRef.current >= 0) {
        registries.get(gl)?.delete(rectIdRef.current);
        rectIdRef.current = -1;
      }
    };
  }, [gl]);

  // 重叠淡出：demand frameloop 下每个渲染帧都会执行，静止时保持最后状态
  useFrame(({ camera, scene, size }) => {
    const element = elementRef.current;
    const rect = screenRectRef.current;
    // 默认关闭：重叠淡出会误伤「刻意贴原子布置」的教学标签（密堆积配位视图
    // 实测见 DECISIONS D-050），待该类视图布局修正后由调用方显式启用
    if (!fadeTo || !element || rect.hw <= 0) return;
    // LineSegments2（drei Line / 晶体接触线）的射线检测必须设置 camera，
    // 否则 three 内部读取 Raycaster.camera.near 直接抛错并中断整个帧循环
    raycaster.camera = camera;
    let covered = 0;
    for (const [sx, sy] of RECT_SAMPLES) {
      screenPoint.set(
        ((rect.x + sx * rect.hw) / size.width) * 2 - 1,
        -((rect.y + sy * rect.hh) / size.height) * 2 + 1,
      );
      raycaster.setFromCamera(screenPoint, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      // 引线/标注线自带粗射线阈值，会误伤自己，排除
      if (hits.some((hit) => !isLineLike(hit.object))) covered += 1;
      if (covered >= minCovered) break;
    }
    applyOpacity(element, covered >= minCovered ? fadeTo : 1);
  });

  return useMemo(() => {
    const calculatePosition = (
      object: Object3D,
      camera: Camera,
      size: HtmlScreenSize,
    ): [number, number] => {
      // 与 drei 默认实现一致的世界坐标投影
      worldPosition.setFromMatrixPosition(object.matrixWorld).project(camera);
      let x = (worldPosition.x * 0.5 + 0.5) * size.width;
      let y = (worldPosition.y * -0.5 + 0.5) * size.height;

      const hw = halfWidthRef.current;
      const hh = halfHeightRef.current;
      // 极窄画布下 pill 可能比画布还宽：margin 钳到画布一半，贴中线不溢出
      const marginX = Math.min(padding + hw, size.width / 2);
      const marginY = Math.min(padding + hh, size.height / 2);
      x = Math.min(Math.max(x, marginX), size.width - marginX);
      y = Math.min(Math.max(y, marginY), size.height - marginY);

      if (collisionGroup) {
        let registry = registries.get(gl);
        if (!registry) {
          registry = new Map();
          registries.set(gl, registry);
        }
        if (rectIdRef.current < 0) rectIdRef.current = nextRectId++;
        for (const [id, rect] of registry) {
          // 跳过自己的上一帧矩形：相机不动时它与自己必然完全重叠，
          // 不跳过则每帧自推 2·hh+2px，标签以帧频持续振荡（T-042 评审实测）
          if (id === rectIdRef.current) continue;
          const overlapX = hw + rect.hw - Math.abs(x - rect.x);
          const overlapY = hh + rect.hh - Math.abs(y - rect.y);
          if (overlapX <= 0 || overlapY <= 0) continue;
          const direction = y >= rect.y ? 1 : -1;
          const push = Math.min(overlapY + 2, maxPush);
          y = Math.min(Math.max(y + direction * push, marginY), size.height - marginY);
        }
        registry.set(rectIdRef.current, { x, y, hw, hh });
      }

      screenRectRef.current = { x, y, hw, hh };
      return [x, y];
    };

    return { measureRef, calculatePosition };
  }, [gl, measureRef, padding, collisionGroup, maxPush]);
}
