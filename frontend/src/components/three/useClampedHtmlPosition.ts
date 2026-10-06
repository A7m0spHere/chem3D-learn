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
//   4. 静态覆盖卡避让（useStaticHtmlObstacle，T-043 遗留「标签×信息卡」）：
//      把画布内固定定位的教学卡片（如杂化页顶部信息卡）登记为障碍物（负 id），
//      所有走 calculatePosition 的标签必须完全让出卡片矩形——躲进半透明卡片
//      下面等于内容不可达，不受 maxPush 约束。
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
  /** 静态覆盖卡障碍物（useStaticHtmlObstacle 登记，负 id）：标签须完全让出 */
  obstacle?: boolean;
  /** 本帧被覆盖卡/唤醒带堆叠推离的方向（+1 向下 / -1 向上）：唤醒带内的
      标签已贴住卡片边缘，后来的标签必须沿同方向继续让位，对称互推会把
      对方推回卡内或压回更早的标签上（360px 实测 Y×p1 冻结 85% 叠印） */
  wake?: number;
};

// 按 renderer（即画布）分 registry，避免多画布互相干扰
const registries = new WeakMap<WebGLRenderer, Map<number, RegisteredRect>>();
let nextRectId = 1;
// 障碍物用负 id：分离循环只让位于更小 id，负 id 保证标签永远让位障碍物，
// 且不与标签 id 空间（正数自增）互相挤占
let nextObstacleId = -1;
// 障碍物 id 按元素复用：组件重挂载后重复注册会让同一张卡留下多个条目，
// 旧条目还持有过期坐标（实测同一信息卡登记出 -1/-2/-3 三条）
const obstacleIdsByElement = new WeakMap<HTMLElement, number>();

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
  const invalidate = useThree((state) => state.invalidate);
  const padding = options?.padding ?? 8;
  const collisionGroup = options?.collisionGroup;
  const maxPush = options?.maxPush ?? 72;
  // 默认 undefined（关闭）：重叠淡出会误伤「刻意贴原子布置」的教学标签
  //（密堆积配位视图实测见 DECISIONS D-050），由调用方显式传 fadeTo 启用。
  // 修复（T-043 Phase 2）：原实现 `?? 0.3` 使淡出对全部接入标签默认开启，
  // 与 D-050 决策相反——配位视图三个教学徽章被淡成 0.3 不可读。
  const fadeTo = options?.fadeTo;
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

  // 实测尺寸变化后主动触发几帧重渲染：demand 渲染模式下帧循环在 React 提交后
  // 很快停止，而挂载首帧 pill 尚未量得尺寸（hw/hh=0），分离/钳制会按零尺寸点
  // 跳过并不再有机会收敛（T-043 Phase 2 在杂化模式切换后实测冻结的 38% 叠印）。
  const settleFramesRef = useRef(0);
  const scheduleSettle = useCallback(() => {
    if (settleFramesRef.current) return;
    const tick = () => {
      settleFramesRef.current -= 1;
      invalidate();
      if (settleFramesRef.current > 0) {
        requestAnimationFrame(tick);
      } else {
        settleFramesRef.current = 0;
      }
    };
    settleFramesRef.current = 3;
    requestAnimationFrame(tick);
  }, [invalidate]);

  const measureRef = useCallback(
    (element: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      elementRef.current = element;
      if (!element) return;
      const update = () => {
        const rect = element.getBoundingClientRect();
        const halfWidth = rect.width / 2;
        const halfHeight = rect.height / 2;
        if (
          Math.abs(halfWidth - halfWidthRef.current) < 0.5 &&
          Math.abs(halfHeight - halfHeightRef.current) < 0.5
        ) {
          return;
        }
        halfWidthRef.current = halfWidth;
        halfHeightRef.current = halfHeight;
        scheduleSettle();
      };
      update();
      const observer = new ResizeObserver(update);
      observer.observe(element);
      observerRef.current = observer;
    },
    [scheduleSettle],
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

        // 两段显式遍历，不依赖 Map 插入序：障碍物可能晚于标签首帧才注册完成，
        // 若按插入序迭代，会先做标签分离、再被末尾的障碍物推回彼此身上
        //（实测 Y 推开 p1 后 p1 又被卡片推回 Y 上，冻结成 85% 叠印）。
        // Pass 1（硬约束）：完全让出覆盖卡，半透明卡片下面的标签学生读不到。
        let wake = 0;
        for (const [id, rect] of registry) {
          if (!rect.obstacle || id >= rectIdRef.current) continue;
          const overlapX = hw + rect.hw - Math.abs(x - rect.x);
          const overlapY = hh + rect.hh - Math.abs(y - rect.y);
          if (overlapX <= 0 || overlapY <= 0) continue;
          const direction = y >= rect.y ? 1 : -1;
          // 推到对方远侧外 2px：direction*(y-rect.y) 在同侧时为 |Δ|（等价于
          // 旧的 overlapY+2），穿越中心时为 -|Δ|，需补足 2|Δ| 才能完全越过后停住
          const push = Math.min(
            hh + rect.hh + 2 - direction * (y - rect.y),
            Math.max(size.width, size.height),
          );
          y = Math.min(
            Math.max(y + direction * push, marginY),
            size.height - marginY,
          );
          wake = direction;
        }

        // Pass 2（软约束）：标签×标签单向让位（只让位于更早注册的标签，保证确定
        // 收敛；双向互推会逐帧互赶，T-043 Phase 2 在极性页实测同一对标签先后采样
        // 25%/31%，这也是 D-050「后计算者让先计算者」的本意）。方向优先级：
        // 对方已被卡在唤醒带 → 沿其唤醒方向继续堆叠；自己被卡推过 → 沿推离
        // 方向；否则按自然相对位置。对称互推在唤醒带里会把对方推回卡内。
        for (const [id, rect] of registry) {
          if (rect.obstacle || id >= rectIdRef.current) continue;
          const overlapX = hw + rect.hw - Math.abs(x - rect.x);
          const overlapY = hh + rect.hh - Math.abs(y - rect.y);
          if (overlapX <= 0 || overlapY <= 0) continue;
          const direction =
            rect.wake ? rect.wake
            : wake !== 0 ? wake
            : y >= rect.y ? 1 : -1;
          const push = Math.min(
            hh + rect.hh + 2 - direction * (y - rect.y),
            maxPush,
          );
          y = Math.min(Math.max(y + direction * push, marginY), size.height - marginY);
          if (rect.wake || wake !== 0) wake = direction;
        }
        registry.set(rectIdRef.current, { x, y, hw, hh, wake });
      }

      screenRectRef.current = { x, y, hw, hh };
      return [x, y];
    };

    return { measureRef, calculatePosition };
  }, [gl, measureRef, padding, collisionGroup, maxPush]);
}

/**
 * 把画布内固定定位的教学卡片登记为碰撞障碍物（能力 4，T-043 遗留「标签×信息卡」）。
 *
 * 返回 ref 回调，挂到卡片根元素上。卡片矩形按画布相对坐标写入 registry（负 id），
 * 本画布所有走 useClampedHtmlPosition 的标签会完全让出该矩形。卡片不可见
 * （display:none，如移动端隐藏的图例卡）时自动退出 registry，重新可见即恢复。
 *
 * 坐标系与 calculatePosition 一致（画布 CSS 像素）；卡片相对画布的位置只在
 * 布局变化时改变，ResizeObserver（卡片 + 画布）与 useThree size 变化时重测即可，
 * 无需逐帧更新。
 */
export function useStaticHtmlObstacle(): (element: HTMLElement | null) => void {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const elementRef = useRef<HTMLElement | null>(null);
  const rectIdRef = useRef(-1);
  const observerRef = useRef<ResizeObserver | null>(null);

  const register = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (!element.isConnected || rect.width <= 0 || rect.height <= 0) {
      // 未连接 / 不可见（display:none，如移动端隐藏的图例卡）的卡片不参与避让，
      // 避免零尺寸矩形吃掉边缘 2px 的假相交
      if (rectIdRef.current >= 0) {
        registries.get(gl)?.delete(rectIdRef.current);
        obstacleIdsByElement.delete(element);
        rectIdRef.current = -1;
      }
      return;
    }
    const canvasRect = gl.domElement.getBoundingClientRect();
    let registry = registries.get(gl);
    if (!registry) {
      registry = new Map();
      registries.set(gl, registry);
    }
    // id 按元素复用：重挂载 / RO 重测都覆盖同一条目，不留过期坐标的幽灵条目
    let id = obstacleIdsByElement.get(element);
    if (id === undefined) {
      id = nextObstacleId--;
      obstacleIdsByElement.set(element, id);
    }
    rectIdRef.current = id;
    registry.set(id, {
      x: rect.x - canvasRect.x + rect.width / 2,
      y: rect.y - canvasRect.y + rect.height / 2,
      hw: rect.width / 2,
      hh: rect.height / 2,
      obstacle: true,
    });
  }, [gl]);

  const measureRef = useCallback(
    (element: HTMLElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      const previous = elementRef.current;
      elementRef.current = element;
      if (!element) {
        if (rectIdRef.current >= 0) {
          registries.get(gl)?.delete(rectIdRef.current);
          if (previous) obstacleIdsByElement.delete(previous);
          rectIdRef.current = -1;
        }
        return;
      }
      const observer = new ResizeObserver(register);
      observer.observe(element);
      observer.observe(gl.domElement);
      observerRef.current = observer;
      register();
    },
    [gl, register],
  );

  // 画布 CSS 尺寸变化（窗口 resize / 折叠面板挤压）时画布相对坐标可能变化，
  // ResizeObserver 覆盖大部分场景，size 依赖兜底重测一次
  useEffect(() => {
    register();
  }, [register, size.width, size.height]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (elementRef.current) obstacleIdsByElement.delete(elementRef.current);
      elementRef.current = null;
      if (rectIdRef.current >= 0) {
        registries.get(gl)?.delete(rectIdRef.current);
        rectIdRef.current = -1;
      }
    };
  }, [gl]);

  return measureRef;
}
