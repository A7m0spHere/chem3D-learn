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

  const detached = detachBuilderAtom(initial, detachAtomId);
  detached.atoms = detached.atoms.map((candidate) => {
    if (candidate.id !== detachAtomId) return candidate;
    const direction = normalize(candidate.position[0] === 0 && candidate.position[1] === 0 && candidate.position[2] === 0
      ? [0.8, 0.45, 0.3]
      : candidate.position);
    return { ...candidate, position: add(candidate.position, scale(direction, 0.62)) };
  });
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
  const isDirty = !areBuilderMoleculesEqual(state.present, state.initial);
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
      return commit(state, detachBuilderAtom(state.present, action.atomId), "已断开该原子的全部相邻键。");
    }
    case "remove-atom": {
      if (!state.present.atoms.some((candidate) => candidate.id === action.atomId)) return state;
      const next = cloneBuilderMolecule(state.present);
      next.atoms = next.atoms.filter((candidate) => candidate.id !== action.atomId);
      next.bonds = next.bonds.filter((candidate) => !candidate.atomIds.includes(action.atomId));
      return commit(state, next, "已移除原子以及与它相连的键。");
    }
    case "remove-bond": {
      if (!state.present.bonds.some((candidate) => candidate.id === action.bondId)) return state;
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
    case "reset":
      return {
        ...state,
        present: cloneBuilderMolecule(state.initial),
        past: [],
        future: [],
        feedback: { tone: "info", messageZh: "已恢复进入实验室时的起始分子。" },
      };
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
  let position = stagingPosition(next.atoms.length);
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
  const targetPosition = attachToId
    ? getSuggestedPosition(next, attachToId, attachmentTemplate.element, 1)
    : stagingPosition(next.atoms.length);
  const offset = sub(targetPosition, attachmentTemplate.position);

  if (attachToId) {
    const attachmentId = ids.get(template.attachmentAtomId)!;
    const temporary: BuilderMolecule = {
      ...next,
      atoms: [...next.atoms, { id: attachmentId, element: attachmentTemplate.element, position: targetPosition }],
    };
    const allowed = canSetBond(temporary, attachToId, attachmentId, 1);
    if (!allowed.ok) return withFeedback(state, "error", allowed.messageZh);
  }

  template.atoms.forEach((candidate) => {
    next.atoms.push({
      id: ids.get(candidate.templateId)!,
      element: candidate.element,
      label: candidate.label,
      position: add(candidate.position, offset),
    });
  });
  template.bonds.forEach((candidate) => {
    next.bonds.push({
      id: nextBuilderId(next, "bond"),
      atomIds: [ids.get(candidate.atomIds[0])!, ids.get(candidate.atomIds[1])!],
      order: candidate.order,
    });
  });
  if (attachToId) {
    next.bonds.push({
      id: nextBuilderId(next, "bond"),
      atomIds: [attachToId, ids.get(template.attachmentAtomId)!],
      order: 1,
    });
  }
  return commit(state, next, `已添加${template.nameZh}${attachToId ? "并连接到所选原子" : ""}。`, "success");
}

function dropAtom(
  state: BuilderHistoryState,
  action: Extract<BuilderAction, { type: "drop-atom" }>,
): BuilderHistoryState {
  const next = action.detach ? detachBuilderAtom(state.present, action.atomId) : cloneBuilderMolecule(state.present);
  const moving = next.atoms.find((candidate) => candidate.id === action.atomId);
  if (!moving) return state;
  next.atoms = next.atoms.map((candidate) =>
    candidate.id === action.atomId ? { ...candidate, position: [...action.position] as BuilderVec3 } : candidate,
  );
  if (action.connectToId) {
    const allowed = canSetBond(next, action.atomId, action.connectToId, action.order);
    if (!allowed.ok) return withFeedback(state, "error", allowed.messageZh);
    const snappedPosition = getSuggestedPosition(next, action.connectToId, moving.element, action.order);
    next.atoms = next.atoms.map((candidate) =>
      candidate.id === action.atomId ? { ...candidate, position: snappedPosition } : candidate,
    );
    const existing = findBondBetween(next, action.atomId, action.connectToId);
    if (existing) {
      next.bonds = next.bonds.map((candidate) =>
        candidate.id === existing.id ? { ...candidate, order: action.order } : candidate,
      );
    } else {
      next.bonds.push({
        id: nextBuilderId(next, "bond"),
        atomIds: [action.connectToId, action.atomId],
        order: action.order,
      });
    }
    return commit(state, next, `已吸附并形成${bondOrderLabel(action.order)}。`, "success");
  }
  return commit(state, next, action.detach ? "已把原子整体拔下。" : "已调整原子位置。" );
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
  messageZh: string,
  tone: BuilderFeedback["tone"] = "info",
): BuilderHistoryState {
  if (areBuilderMoleculesEqual(state.present, next)) return withFeedback(state, tone, messageZh);
  return {
    ...state,
    present: next,
    past: [...state.past, cloneBuilderMolecule(state.present)].slice(-HISTORY_LIMIT),
    future: [],
    feedback: { tone, messageZh },
  };
}

function withFeedback(
  state: BuilderHistoryState,
  tone: BuilderFeedback["tone"],
  messageZh: string,
): BuilderHistoryState {
  return { ...state, feedback: { tone, messageZh } };
}

function stagingPosition(index: number): BuilderVec3 {
  const column = index % 4;
  const row = Math.floor(index / 4) % 3;
  return [-1.35 + column * 0.9, 1.15 - row * 0.85, ((index % 2) - 0.5) * 0.35];
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
