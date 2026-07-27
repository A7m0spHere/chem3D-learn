import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Atom,
  Beaker,
  CircleAlert,
  Info,
  PanelLeftClose,
  PanelRightClose,
  SaveOff,
  X,
} from "lucide-react";
import {
  Link,
  useBeforeUnload,
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { OrganicBuilderInfoPanel } from "@/components/learning/OrganicBuilderInfoPanel";
import { OrganicBuilderToolbox } from "@/components/learning/OrganicBuilderToolbox";
import { OrganicBuilderCanvas } from "@/components/three/OrganicBuilderCanvas";
import { Button } from "@/components/ui/button";
import { getOrganicBuilderSeed } from "@/data/organicBuilderSeeds";
import { useOrganicBuilder, type BuilderFeedback } from "@/hooks/useOrganicBuilder";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  canSetBond,
  detectFunctionalGroups,
  findKnownMolecule,
  getFormula,
  getRelativeMolecularMass,
  validateBuilderMolecule,
} from "@/lib/organicBuilderChemistry";
import { matchBuilderBondAngles } from "@/lib/organicBuilderGeometry";
import { generateOrganicSystematicName } from "@/lib/organicBuilderNomenclature";
import type {
  BuilderBondOrder,
  BuilderElement,
  BuilderFragmentId,
  OrganicBuilderNavigationState,
} from "@/types/organicBuilder";

export function OrganicBuilderPage() {
  const { seedId = "new" } = useParams();
  // seedId 变化时强制重挂载内层组件：useReducer 的初始状态只在挂载时生效一次，
  // 复用实例会出现"标题换了、画布还是旧分子"的状态错乱。
  return <OrganicBuilderPageInner key={seedId} seedId={seedId} />;
}

type PendingConfirmKind = "new-blank" | "reset";

const CONFIRM_COPY: Record<PendingConfirmKind, { title: string; body: string; confirmText: string }> = {
  "new-blank": {
    title: "清空当前模型并新建空白画布？",
    body: "清空后仍可以通过“撤销”找回当前拼装。",
    confirmText: "清空并新建",
  },
  reset: {
    title: "恢复为进入实验室时的起始分子？",
    body: "当前修改会被放回起始状态，仍可以通过“撤销”找回。",
    confirmText: "恢复起点",
  },
};

function OrganicBuilderPageInner({ seedId }: { seedId: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const navigationState = (location.state ?? {}) as OrganicBuilderNavigationState;
  const hasEntryTransition = navigationState.entryTransition === "viewer-expand";
  const seed = useMemo(
    () => seedId === "new" ? undefined : getOrganicBuilderSeed(seedId),
    [seedId],
  );
  const { state, dispatch, isDirty, canUndo, canRedo } = useOrganicBuilder(seed, navigationState.detachAtomId);
  const [selectedAtomId, setSelectedAtomId] = useState<string>();
  const [selectedBondId, setSelectedBondId] = useState<string>();
  const [selectedBondOrder, setSelectedBondOrder] = useState<BuilderBondOrder>(1);
  const [canvasReady, setCanvasReady] = useState(false);
  const [overlaysReady, setOverlaysReady] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);
  const [desktopToolboxOpen, setDesktopToolboxOpen] = useState(true);
  const [desktopInfoOpen, setDesktopInfoOpen] = useState(true);
  const [activeCompactPanel, setActiveCompactPanel] = useState<"toolbox" | "info">();
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmKind>();
  const [toast, setToast] = useState<{ feedback: BuilderFeedback; visible: boolean }>();
  const molecule = state.present;
  const selectedAtom = molecule.atoms.find((candidate) => candidate.id === selectedAtomId);
  const selectedBond = molecule.bonds.find((candidate) => candidate.id === selectedBondId);
  const validation = useMemo(() => validateBuilderMolecule(molecule), [molecule]);
  const bondAngles = useMemo(
    () => validation.isComplete ? matchBuilderBondAngles(molecule) : [],
    [molecule, validation.isComplete],
  );
  const formula = useMemo(() => getFormula(molecule), [molecule]);
  const relativeMass = useMemo(() => getRelativeMolecularMass(molecule), [molecule]);
  const knownMolecule = useMemo(() => findKnownMolecule(molecule), [molecule]);
  const systematicName = useMemo(
    () => knownMolecule ? undefined : generateOrganicSystematicName(molecule),
    [knownMolecule, molecule],
  );
  const functionalGroups = useMemo(() => detectFunctionalGroups(molecule), [molecule]);
  const blocker = useBlocker(isDirty);

  useBeforeUnload(
    useCallback((event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }, [isDirty]),
  );

  // 反馈提示：进入时保留在 state 中 3.6 秒；清除后先播放退出过渡，再从 DOM 移除。
  useEffect(() => {
    if (state.feedback) {
      setToast({ feedback: state.feedback, visible: true });
      const timer = window.setTimeout(() => dispatch({ type: "clear-feedback" }), 3600);
      return () => window.clearTimeout(timer);
    }
    setToast((current) => current ? { ...current, visible: false } : undefined);
    const removeTimer = window.setTimeout(() => setToast(undefined), 260);
    return () => window.clearTimeout(removeTimer);
  }, [dispatch, state.feedback]);

  // 覆盖层入场：共享舞台过渡时等 360ms 再入场；直接访问也从隐藏状态起步，
  // 下一帧再显示，让浮层有一次错峰滑入而不是同帧闪现。
  useEffect(() => {
    if (!hasEntryTransition) {
      const frame = window.requestAnimationFrame(() => setOverlaysReady(true));
      return () => window.cancelAnimationFrame(frame);
    }
    document.documentElement.dataset.organicBuilderTransition = "viewer-expand";
    const timer = window.setTimeout(() => setOverlaysReady(true), 360);
    const cleanupTimer = window.setTimeout(() => {
      delete document.documentElement.dataset.organicBuilderTransition;
    }, 700);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(cleanupTimer);
      delete document.documentElement.dataset.organicBuilderTransition;
    };
  }, [hasEntryTransition]);

  // 入场完成后移除错峰延迟，面板开合不再带 delay。
  useEffect(() => {
    if (!overlaysReady) return;
    const timer = window.setTimeout(() => setEntranceDone(true), 650);
    return () => window.clearTimeout(timer);
  }, [overlaysReady]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      // 只在文本输入场景放弃快捷键；焦点落在按钮上时 Ctrl+Z/Delete 仍应生效
      //（点完"添加原子"按钮立刻撤销是最常见的操作序列）。
      if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || target?.isContentEditable) return;
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "z") {
        event.preventDefault();
        dispatch({ type: event.shiftKey ? "redo" : "undo" });
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "y") {
        event.preventDefault();
        dispatch({ type: "redo" });
        return;
      }
      if (event.key === "Escape") {
        setSelectedAtomId(undefined);
        setSelectedBondId(undefined);
        return;
      }
      if (event.key !== "Backspace" && event.key !== "Delete") return;
      if (selectedAtomId) {
        event.preventDefault();
        dispatch({ type: "remove-atom", atomId: selectedAtomId });
        setSelectedAtomId(undefined);
      } else if (selectedBondId) {
        event.preventDefault();
        dispatch({ type: "remove-bond", bondId: selectedBondId });
        setSelectedBondId(undefined);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, selectedAtomId, selectedBondId]);

  if (seedId !== "new" && !seed) {
    return (
      <main className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center bg-background px-4 text-center">
        <CircleAlert className="h-10 w-10 text-accent" />
        <h1 className="mt-4 text-2xl font-bold text-text-primary">没有找到这个拼装种子</h1>
        <p className="mt-2 text-text-secondary">请从有机立体结构模块重新进入，或直接新建空白模型。</p>
        <div className="mt-6 flex gap-3">
          <Button asChild variant="outline"><Link to="/modules">返回模块</Link></Button>
          <Button asChild><Link to="/lab/organic-builder/new">新建空白</Link></Button>
        </div>
      </main>
    );
  }

  const selectBond = (bondId?: string) => {
    setSelectedBondId(bondId);
    if (!bondId) return;
    const candidate = molecule.bonds.find((bond) => bond.id === bondId);
    if (candidate) setSelectedBondOrder(candidate.order);
  };

  const handleBondOrderChange = (order: BuilderBondOrder) => {
    if (selectedBond) {
      // 预检失败时不更新本地选中键级，避免按钮高亮与实际键级失去同步；
      // dispatch 仍会发出，由 reducer 给出具体的错误提示。
      const allowed = canSetBond(molecule, selectedBond.atomIds[0], selectedBond.atomIds[1], order);
      dispatch({
        type: "set-bond-order",
        firstAtomId: selectedBond.atomIds[0],
        secondAtomId: selectedBond.atomIds[1],
        order,
      });
      if (!allowed.ok) return;
    }
    setSelectedBondOrder(order);
  };

  const handleAddAtom = (element: BuilderElement) => {
    dispatch({ type: "add-atom", element, attachToId: selectedAtomId, order: selectedBondOrder });
  };

  const handleAddFragment = (fragmentId: BuilderFragmentId) => {
    dispatch({ type: "add-fragment", fragmentId, attachToId: selectedAtomId });
  };

  const handleRemoveSelection = () => {
    if (selectedAtomId) {
      dispatch({ type: "remove-atom", atomId: selectedAtomId });
      setSelectedAtomId(undefined);
      return;
    }
    if (selectedBondId) {
      dispatch({ type: "remove-bond", bondId: selectedBondId });
      setSelectedBondId(undefined);
    }
  };

  const clearSelection = () => {
    setSelectedAtomId(undefined);
    setSelectedBondId(undefined);
  };

  const handleNewBlank = () => {
    if (molecule.atoms.length > 0) {
      setPendingConfirm("new-blank");
      return;
    }
    dispatch({ type: "new-blank" });
    clearSelection();
  };

  const handleReset = () => {
    if (isDirty) {
      setPendingConfirm("reset");
      return;
    }
    dispatch({ type: "reset" });
    clearSelection();
  };

  const handleConfirmPending = () => {
    if (!pendingConfirm) return;
    dispatch({ type: pendingConfirm === "new-blank" ? "new-blank" : "reset" });
    clearSelection();
    setPendingConfirm(undefined);
  };

  const handleBack = () => {
    // 优先返回来源模块页并带反向共享元素过渡；直达链接（无历史）兜底到模块列表。
    if (navigationState.sourceModuleId) {
      navigate(`/module/${navigationState.sourceModuleId}`, {
        state: { returnedFromBuilder: true },
        viewTransition: !prefersReducedMotion,
      });
      return;
    }
    if (location.key === "default") {
      navigate("/modules");
      return;
    }
    navigate(-1);
  };

  const overlayHidden = "!invisible !pointer-events-none !opacity-0";
  const staggerDelay = (delayClass: string) => entranceDone ? "" : delayClass;

  return (
    <main
      className="relative h-[calc(100dvh-60px)] min-h-[520px] overflow-hidden bg-background"
      data-canvas-ready={canvasReady ? "true" : "false"}
      data-entry-transition={hasEntryTransition ? "viewer-expand" : "direct"}
      data-testid="organic-builder-page"
    >
      <div className="absolute inset-0 z-0" data-testid="organic-builder-transition-stage">
        <OrganicBuilderCanvas
          bondAngles={bondAngles}
          immersive
          molecule={molecule}
          onDropAtom={(payload) => dispatch({ type: "drop-atom", ...payload })}
          onReady={() => setCanvasReady(true)}
          onSelectAtom={setSelectedAtomId}
          onSelectBond={selectBond}
          selectedAtomId={selectedAtomId}
          selectedBondId={selectedBondId}
          selectedBondOrder={selectedBondOrder}
        />
      </div>

      <header
        className={`pointer-events-none absolute inset-x-3 top-3 z-40 transition-all duration-300 ease-out-soft sm:inset-x-4 ${overlaysReady ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"}`}
        data-testid="organic-builder-overlay-header"
      >
        <div className="pointer-events-auto mx-auto flex max-w-[1560px] items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/90 px-3 py-2.5 shadow-overlay backdrop-blur-xl sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <Button aria-label="返回上一个页面" className="h-10 w-10 shrink-0 p-0" onClick={handleBack} size="sm" variant="ghost">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-dark sm:flex">
              <Beaker className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-[11px] font-bold uppercase tracking-[0.12em] text-primary-dark sm:text-xs">3D 有机分子拼装实验室</div>
              <h1 className="truncate text-base font-black tracking-tight text-text-primary sm:text-xl">
                {seed?.nameZh ?? "空白分子模型盒"}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-1 xl:flex" role="group" aria-label="实验室面板显示">
              <Button
                aria-controls="builder-toolbox-panel"
                aria-pressed={desktopToolboxOpen}
                className="h-9"
                onClick={() => setDesktopToolboxOpen((value) => !value)}
                size="sm"
                variant={desktopToolboxOpen ? "secondary" : "ghost"}
              >
                <Atom className="h-4 w-4" />模型盒
              </Button>
              <Button
                aria-controls="builder-info-panel"
                aria-pressed={desktopInfoOpen}
                className="h-9"
                onClick={() => setDesktopInfoOpen((value) => !value)}
                size="sm"
                variant={desktopInfoOpen ? "secondary" : "ghost"}
              >
                <Info className="h-4 w-4" />结构信息
              </Button>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-semibold sm:px-3 sm:text-sm ${isDirty ? "bg-accent/15 text-accent-dark" : "bg-primary/10 text-primary-dark"}`}>
              <SaveOff className="h-4 w-4" />
              <span className="hidden sm:inline">{isDirty ? "有未保存的课堂草稿" : "当前为起始状态"}</span>
              <span className="sm:hidden">{isDirty ? "已修改" : "起始态"}</span>
            </div>
          </div>
        </div>
      </header>

      {toast ? (
        <BuilderFeedbackToast
          feedback={toast.feedback}
          onClose={() => dispatch({ type: "clear-feedback" })}
          visible={toast.visible && overlaysReady}
        />
      ) : null}

      <div
        className={`absolute bottom-[76px] left-3 right-3 z-30 max-h-[72%] overflow-y-auto rounded-2xl transition-all duration-300 ease-out-soft md:bottom-4 md:left-4 md:right-auto md:top-[84px] md:max-h-none md:w-[330px] xl:w-[280px] ${staggerDelay("delay-75")} ${
          activeCompactPanel === "toolbox"
            ? "visible pointer-events-auto translate-y-0 opacity-100 md:translate-x-0"
            : "invisible pointer-events-none translate-y-5 opacity-0 md:-translate-x-5 md:translate-y-0"
        } ${
          desktopToolboxOpen
            ? "xl:visible xl:pointer-events-auto xl:translate-x-0 xl:translate-y-0 xl:opacity-100"
            : "xl:invisible xl:pointer-events-none xl:-translate-x-[calc(100%+2rem)] xl:translate-y-0 xl:opacity-0"
        } ${overlaysReady ? "" : overlayHidden}`}
        id="builder-toolbox-panel"
      >
        <button
          aria-label="收起模型盒"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          onClick={() => {
            setActiveCompactPanel(undefined);
            setDesktopToolboxOpen(false);
          }}
          type="button"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
        <OrganicBuilderToolbox
          canRedo={canRedo}
          canUndo={canUndo}
          onAddAtom={handleAddAtom}
          onAddFragment={handleAddFragment}
          onAutoFillHydrogens={() => dispatch({ type: "auto-fill-hydrogens" })}
          onDetachAtom={() => selectedAtomId && dispatch({ type: "detach-atom", atomId: selectedAtomId })}
          onNewBlank={handleNewBlank}
          onRedo={() => dispatch({ type: "redo" })}
          onRemoveSelection={handleRemoveSelection}
          onReset={handleReset}
          onSelectedBondOrderChange={handleBondOrderChange}
          onUndo={() => dispatch({ type: "undo" })}
          selectedAtomId={selectedAtomId}
          selectedAtomLabel={selectedAtom?.element}
          selectedBond={selectedBond}
          selectedBondOrder={selectedBondOrder}
        />
      </div>

      <div
        className={`absolute bottom-[76px] left-3 right-3 z-30 max-h-[72%] overflow-y-auto rounded-2xl transition-all duration-300 ease-out-soft md:bottom-4 md:left-auto md:right-4 md:top-[84px] md:max-h-none md:w-[350px] xl:w-[340px] ${staggerDelay("delay-100")} ${
          activeCompactPanel === "info"
            ? "visible pointer-events-auto translate-y-0 opacity-100 md:translate-x-0"
            : "invisible pointer-events-none translate-y-5 opacity-0 md:translate-x-5 md:translate-y-0"
        } ${
          desktopInfoOpen
            ? "xl:visible xl:pointer-events-auto xl:translate-x-0 xl:translate-y-0 xl:opacity-100"
            : "xl:invisible xl:pointer-events-none xl:translate-x-[calc(100%+2rem)] xl:translate-y-0 xl:opacity-0"
        } ${overlaysReady ? "" : overlayHidden}`}
        id="builder-info-panel"
      >
        <button
          aria-label="收起结构信息"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          onClick={() => {
            setActiveCompactPanel(undefined);
            setDesktopInfoOpen(false);
          }}
          type="button"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
        <OrganicBuilderInfoPanel
          bondAngles={bondAngles}
          formula={formula}
          functionalGroups={functionalGroups}
          knownMolecule={knownMolecule}
          relativeMass={relativeMass}
          seedNoteZh={seed?.noteZh}
          systematicName={systematicName}
          validation={validation}
        />
      </div>

      <div className={`pointer-events-none absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-sm text-text-secondary shadow-lg backdrop-blur-xl transition-opacity duration-300 ease-out-soft xl:flex ${staggerDelay("delay-150")} ${overlaysReady ? "opacity-100" : "opacity-0"}`}>
        拖动原子拆装 · 拖动空白旋转 · 滚轮缩放
      </div>

      <div className={`absolute bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/80 bg-white/92 p-2 shadow-overlay-strong backdrop-blur-xl transition-all duration-300 ease-out-soft xl:hidden ${staggerDelay("delay-150")} ${overlaysReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`} role="group" aria-label="打开实验室面板">
        <Button
          aria-controls="builder-toolbox-panel"
          aria-expanded={activeCompactPanel === "toolbox"}
          onClick={() => setActiveCompactPanel((value) => value === "toolbox" ? undefined : "toolbox")}
          size="sm"
          variant={activeCompactPanel === "toolbox" ? "default" : "ghost"}
        >
          <Atom className="h-4 w-4" />模型盒
        </Button>
        <Button
          aria-controls="builder-info-panel"
          aria-expanded={activeCompactPanel === "info"}
          onClick={() => setActiveCompactPanel((value) => value === "info" ? undefined : "info")}
          size="sm"
          variant={activeCompactPanel === "info" ? "default" : "ghost"}
        >
          <Info className="h-4 w-4" />结构信息
        </Button>
      </div>

      {pendingConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="motion-scale-in w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-text-primary">{CONFIRM_COPY[pendingConfirm].title}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{CONFIRM_COPY[pendingConfirm].body}</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button autoFocus onClick={() => setPendingConfirm(undefined)}>继续拼装</Button>
              <Button onClick={handleConfirmPending} variant="outline">{CONFIRM_COPY[pendingConfirm].confirmText}</Button>
            </div>
          </div>
        </div>
      ) : null}

      {blocker.state === "blocked" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="motion-scale-in w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-text-primary">要离开当前拼装吗？</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              这份课堂草稿没有保存到本机。离开后，本次拆装和位置调整都会丢失。
            </p>
            <div className="mt-6 flex justify-end gap-3">
              {/* 安全动作用主按钮，破坏性动作降为次要样式，避免误触"放弃"。 */}
              <Button autoFocus onClick={() => blocker.reset()}>继续拼装</Button>
              <Button onClick={() => blocker.proceed()} variant="outline">放弃并离开</Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function BuilderFeedbackToast({
  feedback,
  onClose,
  visible,
}: {
  feedback: BuilderFeedback;
  onClose: () => void;
  visible: boolean;
}) {
  // 挂载后下一帧再切到可见态，让入场也走 transition；退出由父级先置 visible=false 再延迟卸载。
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const shown = entered && visible;
  return (
    <div
      className={`absolute left-1/2 top-[84px] z-50 flex w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-xl transition-all duration-200 ease-out-soft ${
        feedback.tone === "error"
          ? "border-red-200 bg-red-50/95 text-red-800"
          : feedback.tone === "success"
            ? "border-primary/25 bg-white/95 text-primary-dark"
            : "border-border bg-white/95 text-text-secondary"
      } ${shown ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
      data-testid="builder-feedback"
      role="status"
    >
      <span>{feedback.messageZh}</span>
      <button aria-label="关闭提示" onClick={onClose} type="button">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
