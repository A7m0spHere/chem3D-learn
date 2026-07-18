import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Beaker, CircleAlert, SaveOff, X } from "lucide-react";
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
import { useOrganicBuilder } from "@/hooks/useOrganicBuilder";
import {
  detectFunctionalGroups,
  findKnownMolecule,
  getFormula,
  getRelativeMolecularMass,
  validateBuilderMolecule,
} from "@/lib/organicBuilderChemistry";
import type { BuilderBondOrder, BuilderElement, BuilderFragmentId } from "@/types/organicBuilder";

type BuilderNavigationState = {
  detachAtomId?: string;
};

export function OrganicBuilderPage() {
  const { seedId = "new" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = (location.state ?? {}) as BuilderNavigationState;
  const seed = useMemo(
    () => seedId === "new" ? undefined : getOrganicBuilderSeed(seedId),
    [seedId],
  );
  const { state, dispatch, isDirty, canUndo, canRedo } = useOrganicBuilder(seed, navigationState.detachAtomId);
  const [selectedAtomId, setSelectedAtomId] = useState<string>();
  const [selectedBondId, setSelectedBondId] = useState<string>();
  const [selectedBondOrder, setSelectedBondOrder] = useState<BuilderBondOrder>(1);
  const molecule = state.present;
  const selectedAtom = molecule.atoms.find((candidate) => candidate.id === selectedAtomId);
  const selectedBond = molecule.bonds.find((candidate) => candidate.id === selectedBondId);
  const validation = useMemo(() => validateBuilderMolecule(molecule), [molecule]);
  const formula = useMemo(() => getFormula(molecule), [molecule]);
  const relativeMass = useMemo(() => getRelativeMolecularMass(molecule), [molecule]);
  const knownMolecule = useMemo(() => findKnownMolecule(molecule), [molecule]);
  const functionalGroups = useMemo(() => detectFunctionalGroups(molecule), [molecule]);
  const blocker = useBlocker(isDirty);

  useBeforeUnload(
    useCallback((event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }, [isDirty]),
  );

  useEffect(() => {
    if (!state.feedback) return;
    const timer = window.setTimeout(() => dispatch({ type: "clear-feedback" }), 3600);
    return () => window.clearTimeout(timer);
  }, [dispatch, state.feedback]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        dispatch({ type: event.shiftKey ? "redo" : "undo" });
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
    setSelectedBondOrder(order);
    if (!selectedBond) return;
    dispatch({
      type: "set-bond-order",
      firstAtomId: selectedBond.atomIds[0],
      secondAtomId: selectedBond.atomIds[1],
      order,
    });
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

  const handleNewBlank = () => {
    if (molecule.atoms.length > 0 && !window.confirm("清空当前模型并新建空白画布？此操作仍可通过“撤销”恢复。")) return;
    dispatch({ type: "new-blank" });
    setSelectedAtomId(undefined);
    setSelectedBondId(undefined);
  };

  const handleReset = () => {
    if (isDirty && !window.confirm("恢复为进入实验室时的起始分子？当前修改将被放弃。")) return;
    dispatch({ type: "reset" });
    setSelectedAtomId(undefined);
    setSelectedBondId(undefined);
  };

  return (
    <main className="min-h-screen bg-background pb-16" data-testid="organic-builder-page">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-start gap-3">
            <Button aria-label="返回上一个页面" className="h-9 w-9 p-0" onClick={() => navigate(-1)} size="sm" variant="ghost">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
                <Beaker className="h-4 w-4" />3D 有机分子拼装实验室
              </div>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
                {seed?.nameZh ?? "空白分子模型盒"}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">像实体模型一样拔下原子、换键、吸附连接，并实时检查价态。</p>
            </div>
          </div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${isDirty ? "bg-accent/15 text-amber-800" : "bg-primary/10 text-primary-dark"}`}>
            <SaveOff className="h-4 w-4" />
            {isDirty ? "有未保存的课堂草稿" : "当前为起始状态"}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {state.feedback ? (
          <div
            className={`mb-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${
              state.feedback.tone === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : state.feedback.tone === "success"
                  ? "border-primary/25 bg-primary/5 text-primary-dark"
                  : "border-border bg-white text-text-secondary"
            }`}
            data-testid="builder-feedback"
            role="status"
          >
            <span>{state.feedback.messageZh}</span>
            <button aria-label="关闭提示" onClick={() => dispatch({ type: "clear-feedback" })} type="button">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="grid items-start gap-5 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
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

          <div className="min-w-0 xl:sticky xl:top-[76px]">
            <OrganicBuilderCanvas
              molecule={molecule}
              onDropAtom={(payload) => dispatch({ type: "drop-atom", ...payload })}
              onSelectAtom={setSelectedAtomId}
              onSelectBond={selectBond}
              selectedAtomId={selectedAtomId}
              selectedBondId={selectedBondId}
              selectedBondOrder={selectedBondOrder}
            />
          </div>

          <OrganicBuilderInfoPanel
            formula={formula}
            functionalGroups={functionalGroups}
            knownMolecule={knownMolecule}
            relativeMass={relativeMass}
            seedNoteZh={seed?.noteZh}
            validation={validation}
          />
        </div>
      </div>

      {blocker.state === "blocked" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-text-primary">要离开当前拼装吗？</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              这份课堂草稿没有保存到本机。离开后，本次拆装和位置调整都会丢失。
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => blocker.reset()} variant="outline">继续拼装</Button>
              <Button onClick={() => blocker.proceed()}>放弃并离开</Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
