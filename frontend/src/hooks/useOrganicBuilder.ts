import { useMemo, useReducer } from "react";
import {
  areBuilderMoleculesEqual,
  autoFillHydrogens,
  builderFragmentTemplates,
  canSetBond,
  cloneBuilderMolecule,
  detachBuilderAtom,
  findBondBetween,
  getSuggestedPosition,
  nextBuilderId,
  rotateVectorBetween,
} from "@/lib/organicBuilderChemistry";
import type {
  BuilderBondOrder,
  BuilderElement,
  BuilderFragmentId,
  BuilderMolecule,
  BuilderSeed,
  BuilderVec3,
} from "@/types/organicBuilder";

const HISTORY_LIMIT = 50;

export type BuilderFeedback = {
  tone: "info" | "error" | "success";
  messageZh: string;
};

export type BuilderHistoryState = {
  initial: BuilderMolecule;
  present: BuilderMolecule;
  past: BuilderMolecule[];
  future: BuilderMolecule[];
  feedback?: BuilderFeedback;
};

export type BuilderAction =
  | { type: "add-atom"; element: BuilderElement; attachToId?: string; order: BuilderBondOrder }
  | { type: "add-fragment"; fragmentId: BuilderFragmentId; attachToId?: string }
  | { type: "drop-atom"; atomId: string; position: BuilderVec3; detach: boolean; connectToId?: string; order: BuilderBondOrder }
  | { type: "detach-atom"; atomId: string }
  | { type: "remove-atom"; atomId: string }
  | { type: "remove-bond"; bondId: string }
  | { type: "set-bond-order"; firstAtomId: string; secondAtomId: string; order: BuilderBondOrder }
  | { type: "auto-fill-hydrogens" }
  | { type: "new-blank" }
  | { type: "reset" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "clear-feedback" };

export function createBuilderHistory(seed?: BuilderSeed, detachAtomId?: string): BuilderHistoryState {
  const initial: BuilderMolecule = seed
    ? cloneBuilderMolecule(seed)
    : { id: "new", atoms: [], bonds: [] };
  if (!detachAtomId || !initial.atoms.some((candidate) => candidate.id === detachAtomId)) {
    return { initial, present: cloneBuilderMolecule(initial), past: [], future: [] };
  }

  const detached = pushDetachedAtomOutward(detachBuilderAtom(initial, detachAtomId), detachAtomId);
  return {
    initial,
    present: detached,
    past: [cloneBuilderMolecule(initial)],
    future: [],
    feedback: { tone: "info", messageZh: "已把抓取的原子整体拔下；可以撤销或重新吸附成键。" },
  };
}

export function useOrganicBuilder(seed?: BuilderSeed, detachAtomId?: string) {
  const initializer = useMemo(() => createBuilderHistory(seed, detachAtomId), [detachAtomId, seed]);
  const [state, dispatch] = useReducer(builderHistoryReducer, initializer);
  // 图同构比较含回溯搜索，用 useMemo 避免每次渲染都重复计算。
  const isDirty = useMemo(
    () => !areBuilderMoleculesEqual(state.present, state.initial),
    [state.initial, state.present],
  );
  return {
    state,
    dispatch,
    isDirty,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}

export function builderHistoryReducer(state: BuilderHistoryState, action: BuilderAction): BuilderHistoryState {
  switch (action.type) {
    case "add-atom":
      return addAtom(state, action.element, action.order, action.attachToId);
    case "add-fragment":
      return addFragment(state, action.fragmentId, action.attachToId);
    case "drop-atom":
      return dropAtom(state, action);
    case "detach-atom": {
      if (!state.present.bonds.some((candidate) => candidate.atomIds.includes(action.atomId))) {
        return withFeedback(state, "info", "这个原子当前没有连接任何键。" );
      }
      // 拔下后把原子沿径向移出少许，避免它仍紧贴旧邻居、看起来像没断开。
      const detached = pushDetachedAtomOutward(
        detachBuilderAtom(state.present, action.atomId),
        action.atomId,
      );
      return commit(state, detached, "已断开该原子的全部相邻键。");
    }
    case "remove-atom": {
      if (!state.present.atoms.some((candidate) => candidate.id === action.atomId)) {
        return withFeedback(state, "info", "没有找到要删除的原子。");
      }
      const next = cloneBuilderMolecule(state.present);
      next.atoms = next.atoms.filter((candidate) => candidate.id !== action.atomId);
      next.bonds = next.bonds.filter((candidate) => !candidate.atomIds.includes(action.atomId));
      return commit(state, next, "已移除原子以及与它相连的键。");
    }
    case "remove-bond": {
      if (!state.present.bonds.some((candidate) => candidate.id === action.bondId)) {
        return withFeedback(state, "info", "没有找到要删除的化学键。");
      }
      return commit(
        state,
        { ...cloneBuilderMolecule(state.present), bonds: state.present.bonds.filter((candidate) => candidate.id !== action.bondId) },
        "已移除所选化学键。",
      );
    }
    case "set-bond-order":
      return setBondOrder(state, action.firstAtomId, action.secondAtomId, action.order);
    case "auto-fill-hydrogens": {
      const next = autoFillHydrogens(state.present);
      if (next.atoms.length === state.present.atoms.length) {
        return withFeedback(state, "info", "当前没有需要按标准价态补充的氢原子。" );
      }
      return commit(state, next, `已补充 ${next.atoms.length - state.present.atoms.length} 个氢原子。`, "success");
    }
    case "new-blank":
      return commit(state, { id: "new", atoms: [], bonds: [] }, "已清空画布，可以从头拼装。" );
    case "reset": {
      const restored = cloneBuilderMolecule(state.initial);
      if (areBuilderMoleculesEqual(state.present, restored)) {
        return withFeedback(state, "info", "当前已是进入实验室时的起始分子。");
      }
      // 恢复起点也走历史栈：误点后可以撤销找回，与"新建空白可撤销"保持一致。
      return commit(state, restored, "已恢复进入实验室时的起始分子。");
    }
    case "undo": {
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      return {
        ...state,
        present: cloneBuilderMolecule(previous),
        past: state.past.slice(0, -1),
        future: [cloneBuilderMolecule(state.present), ...state.future].slice(0, HISTORY_LIMIT),
        feedback: { tone: "info", messageZh: "已撤销上一步。" },
      };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        present: cloneBuilderMolecule(next),
        past: [...state.past, cloneBuilderMolecule(state.present)].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
        feedback: { tone: "info", messageZh: "已重做上一步。" },
      };
    }
    case "clear-feedback":
      return { ...state, feedback: undefined };
    default:
      return state;
  }
}

function addAtom(
  state: BuilderHistoryState,
  element: BuilderElement,
  order: BuilderBondOrder,
  attachToId?: string,
): BuilderHistoryState {
  const next = cloneBuilderMolecule(state.present);
  const id = nextBuilderId(next, element.toLowerCase());
  let position = stagingPosition(next);
  if (attachToId) {
    const target = next.atoms.find((candidate) => candidate.id === attachToId);
    if (!target) return withFeedback(state, "error", "没有找到当前选中的原子。" );
    position = getSuggestedPosition(next, attachToId, element, order);
    next.atoms.push({ id, element, label: element, position });
    const afterAddValidation = canSetBond(next, attachToId, id, order);
    if (!afterAddValidation.ok) return withFeedback(state, "error", afterAddValidation.messageZh);
    next.bonds.push({ id: nextBuilderId(next, "bond"), atomIds: [attachToId, id], order });
    return commit(state, next, `已添加 ${element} 并与所选原子连接。`, "success");
  }
  next.atoms.push({ id, element, label: element, position });
  return commit(state, next, `已把 ${element} 放入待连接区。` );
}

function addFragment(
  state: BuilderHistoryState,
  fragmentId: BuilderFragmentId,
  attachToId?: string,
): BuilderHistoryState {
  const template = builderFragmentTemplates.find((candidate) => candidate.id === fragmentId);
  if (!template) return state;
  const next = cloneBuilderMolecule(state.present);
  const suffix = nextBuilderId(next, "fragment");
  const ids = new Map(template.atoms.map((candidate) => [candidate.templateId, `${suffix}-${candidate.templateId}`]));
  const attachmentTemplate = template.atoms.find((candidate) => candidate.templateId === template.attachmentAtomId)!;
  const attachTarget = attachToId
    ? next.atoms.find((candidate) => candidate.id === attachToId)
    : undefined;
  if (attachToId && !attachTarget) {
    return withFeedback(state, "error", "没有找到当前选中的原子。");
  }
  const targetPosition = attachTarget
    ? getSuggestedPosition(next, attachTarget.id, attachmentTemplate.element, 1)
    : stagingPosition(next);

  if (attachTarget) {
    const attachmentId = ids.get(template.attachmentAtomId)!;
    const temporary: BuilderMolecule = {
      ...next,
      atoms: [...next.atoms, { id: attachmentId, element: attachmentTemplate.element, position: targetPosition }],
    };
    const allowed = canSetBond(temporary, attachTarget.id, attachmentId, 1);
    if (!allowed.ok) return withFeedback(state, "error", allowed.messageZh);
  }

  // 模板以 attachment 原子为原点、anchorDirection 指向母体；拼接时把它旋转对齐到真实母体方向，
  // 片段整体朝外张开，内部键角与模板一致，不会与母体原子交叠。
  const anchorDirection = template.anchorDirection ?? ([-1, 0, 0] as BuilderVec3);
  const actualAnchor = attachTarget ? sub(attachTarget.position, targetPosition) : undefined;
  const placeTemplateAtom = (position: BuilderVec3): BuilderVec3 => {
    const local = sub(position, attachmentTemplate.position);
    const rotated = actualAnchor ? rotateVectorBetween(local, anchorDirection, actualAnchor) : local;
    return add(targetPosition, rotated);
  };

  template.atoms.forEach((candidate) => {
    next.atoms.push({
      id: ids.get(candidate.templateId)!,
      element: candidate.element,
      label: candidate.label,
      position: placeTemplateAtom(candidate.position),
    });
  });
  template.bonds.forEach((candidate) => {
    next.bonds.push({
      id: nextBuilderId(next, "bond"),
      atomIds: [ids.get(candidate.atomIds[0])!, ids.get(candidate.atomIds[1])!],
      order: candidate.order,
    });
  });
  if (attachTarget) {
    next.bonds.push({
      id: nextBuilderId(next, "bond"),
      atomIds: [attachTarget.id, ids.get(template.attachmentAtomId)!],
      order: 1,
    });
  }
  return commit(state, next, `已添加${template.nameZh}${attachTarget ? "并连接到所选原子" : ""}。`, "success");
}

function dropAtom(
  state: BuilderHistoryState,
  action: Extract<BuilderAction, { type: "drop-atom" }>,
): BuilderHistoryState {
  if (!state.present.atoms.some((candidate) => candidate.id === action.atomId)) {
    return withFeedback(state, "info", "没有找到要移动的原子。");
  }
  const next = action.detach ? detachBuilderAtom(state.present, action.atomId) : cloneBuilderMolecule(state.present);
  const moving = next.atoms.find((candidate) => candidate.id === action.atomId);
  if (!moving) return state;
  next.atoms = next.atoms.map((candidate) =>
    candidate.id === action.atomId ? { ...candidate, position: [...action.position] as BuilderVec3 } : candidate,
  );
  if (action.connectToId) {
    const allowed = canSetBond(next, action.atomId, action.connectToId, action.order);
    if (!allowed.ok) {
      // 吸附被价键规则拒绝时保留本次拖动的移动/拔下结果，只是不建键；
      // 若直接丢弃整个动作，原子会瞬间弹回拖动前的位置。
      return commit(state, next, allowed.messageZh, "error");
    }
    const snappedPosition = getSuggestedPosition(next, action.connectToId, moving.element, action.order);
    next.atoms = next.atoms.map((candidate) =>
      candidate.id === action.atomId ? { ...candidate, position: snappedPosition } : candidate,
    );
    // 吸附目标只可能是无键的游离原子或刚被整体拔下的原子，二者与目标之间必无既有键，直接新建。
    next.bonds.push({
      id: nextBuilderId(next, "bond"),
      atomIds: [action.connectToId, action.atomId],
      order: action.order,
    });
    return commit(state, next, `已吸附并形成${bondOrderLabel(action.order)}。`, "success");
  }
  // 纯位置调整不弹提示，避免每次拖动都出现 3.6 秒的常驻通知。
  return commit(state, next, action.detach ? "已把原子整体拔下。" : undefined);
}

function setBondOrder(
  state: BuilderHistoryState,
  firstAtomId: string,
  secondAtomId: string,
  order: BuilderBondOrder,
): BuilderHistoryState {
  const allowed = canSetBond(state.present, firstAtomId, secondAtomId, order);
  if (!allowed.ok) return withFeedback(state, "error", allowed.messageZh);
  const next = cloneBuilderMolecule(state.present);
  const existing = findBondBetween(next, firstAtomId, secondAtomId);
  if (existing) {
    next.bonds = next.bonds.map((candidate) => candidate.id === existing.id ? { ...candidate, order } : candidate);
  } else {
    next.bonds.push({ id: nextBuilderId(next, "bond"), atomIds: [firstAtomId, secondAtomId], order });
  }
  return commit(state, next, `已设置为${bondOrderLabel(order)}。`, "success");
}

function commit(
  state: BuilderHistoryState,
  next: BuilderMolecule,
  messageZh?: string,
  tone: BuilderFeedback["tone"] = "info",
): BuilderHistoryState {
  if (areBuilderMoleculesEqual(state.present, next)) {
    return messageZh ? withFeedback(state, tone, messageZh) : state;
  }
  return {
    ...state,
    present: next,
    past: [...state.past, cloneBuilderMolecule(state.present)].slice(-HISTORY_LIMIT),
    future: [],
    feedback: messageZh ? { tone, messageZh } : undefined,
  };
}

function withFeedback(
  state: BuilderHistoryState,
  tone: BuilderFeedback["tone"],
  messageZh: string,
): BuilderHistoryState {
  return { ...state, feedback: { tone, messageZh } };
}

// 把刚拔下的原子沿径向移出少许，与旧邻居拉开距离，画面上能看出"已断开"。
function pushDetachedAtomOutward(molecule: BuilderMolecule, atomId: string): BuilderMolecule {
  return {
    ...molecule,
    atoms: molecule.atoms.map((candidate) => {
      if (candidate.id !== atomId) return candidate;
      const direction = normalize(
        candidate.position[0] === 0 && candidate.position[1] === 0 && candidate.position[2] === 0
          ? [0.8, 0.45, 0.3]
          : candidate.position,
      );
      return { ...candidate, position: add(candidate.position, scale(direction, 0.62)) };
    }),
  };
}

// 依次尝试暂存区槽位，跳过已被原子占用的位置：
// 槽位按 atoms.length 直接取模会在"删除后再添加"时与残留原子完全重叠（小原子会藏进大原子里）。
function stagingPosition(molecule: BuilderMolecule): BuilderVec3 {
  const occupied = molecule.atoms.map((candidate) => candidate.position);
  for (let index = 0; index < 48; index += 1) {
    const column = index % 4;
    const row = Math.floor(index / 4) % 3;
    const layer = Math.floor(index / 12);
    const candidate: BuilderVec3 = [
      -1.35 + column * 0.9,
      1.15 - row * 0.85,
      ((index % 2) - 0.5) * 0.35 + layer * 0.3,
    ];
    if (occupied.every((position) => distanceBetween(position, candidate) > 0.4)) return candidate;
  }
  return [0, -1.9, 0];
}

function distanceBetween(first: BuilderVec3, second: BuilderVec3): number {
  return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
}

function bondOrderLabel(order: BuilderBondOrder): string {
  return order === 1 ? "单键" : order === 2 ? "双键" : "三键";
}

function add(first: BuilderVec3, second: BuilderVec3): BuilderVec3 {
  return [first[0] + second[0], first[1] + second[1], first[2] + second[2]];
}

function sub(first: BuilderVec3, second: BuilderVec3): BuilderVec3 {
  return [first[0] - second[0], first[1] - second[1], first[2] - second[2]];
}

function scale(value: BuilderVec3, factor: number): BuilderVec3 {
  return [value[0] * factor, value[1] * factor, value[2] * factor];
}

function normalize(value: BuilderVec3): BuilderVec3 {
  const length = Math.hypot(...value) || 1;
  return scale(value, 1 / length);
}
