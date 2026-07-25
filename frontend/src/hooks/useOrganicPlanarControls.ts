import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type {
  AcetyleneLinearMode,
  BenzenePlanarMode,
  EthylenePlanarMode,
  OrganicCoplanarMode,
} from "@/types/molecule";
import type { EthylenePlaneView } from "@/data/ethylenePlanar";
import type { BenzenePlaneView } from "@/data/benzenePlanar";
import type { AcetyleneLineView } from "@/data/acetyleneLinear";

// ---------------------------------------------------------------------------
// 有机平面 / 直线专题 viewer 的控制状态组。
//
// 汇集 organic-coplanar、乙烯、苯、乙炔四个专题的 mode 与视角状态。它们的默认值
// 都是静态的（不依赖 moduleId），切换模块时统一回到 overview / top / front / false。
// 与 useCrystalControls 一样，把「默认值 + 切模块重置」收敛到唯一真源。
// ---------------------------------------------------------------------------

export type OrganicPlanarControls = {
  organicCoplanarMode: OrganicCoplanarMode;
  organicVinylAligned: boolean;
  showOrganicLabels: boolean;
  ethyleneMode: EthylenePlanarMode;
  ethylenePlaneView: EthylenePlaneView;
  benzeneMode: BenzenePlanarMode;
  benzenePlaneView: BenzenePlaneView;
  acetyleneMode: AcetyleneLinearMode;
  acetyleneLineView: AcetyleneLineView;
  setOrganicCoplanarMode: (mode: OrganicCoplanarMode) => void;
  setOrganicVinylAligned: Dispatch<SetStateAction<boolean>>;
  setShowOrganicLabels: Dispatch<SetStateAction<boolean>>;
  setEthyleneMode: (mode: EthylenePlanarMode) => void;
  setEthylenePlaneView: (view: EthylenePlaneView) => void;
  setBenzeneMode: (mode: BenzenePlanarMode) => void;
  setBenzenePlaneView: (view: BenzenePlaneView) => void;
  setAcetyleneMode: (mode: AcetyleneLinearMode) => void;
  setAcetyleneLineView: (view: AcetyleneLineView) => void;
};

/**
 * 管理有机平面 / 直线专题（共面、乙烯、苯、乙炔）的模式与视角状态。
 * `moduleId` 变化时（SPA 切换模块）自动重置回默认值。
 */
export function useOrganicPlanarControls(moduleId: string | undefined): OrganicPlanarControls {
  const [organicCoplanarMode, setOrganicCoplanarMode] = useState<OrganicCoplanarMode>("overview");
  const [organicVinylAligned, setOrganicVinylAligned] = useState(false);
  const [showOrganicLabels, setShowOrganicLabels] = useState(false);
  const [ethyleneMode, setEthyleneMode] = useState<EthylenePlanarMode>("overview");
  const [ethylenePlaneView, setEthylenePlaneView] = useState<EthylenePlaneView>("top");
  const [benzeneMode, setBenzeneMode] = useState<BenzenePlanarMode>("overview");
  const [benzenePlaneView, setBenzenePlaneView] = useState<BenzenePlaneView>("top");
  const [acetyleneMode, setAcetyleneMode] = useState<AcetyleneLinearMode>("overview");
  const [acetyleneLineView, setAcetyleneLineView] = useState<AcetyleneLineView>("front");

  useEffect(() => {
    setOrganicCoplanarMode("overview");
    setOrganicVinylAligned(false);
    setShowOrganicLabels(false);
    setEthyleneMode("overview");
    setEthylenePlaneView("top");
    setBenzeneMode("overview");
    setBenzenePlaneView("top");
    setAcetyleneMode("overview");
    setAcetyleneLineView("front");
  }, [moduleId]);

  return {
    organicCoplanarMode,
    organicVinylAligned,
    showOrganicLabels,
    ethyleneMode,
    ethylenePlaneView,
    benzeneMode,
    benzenePlaneView,
    acetyleneMode,
    acetyleneLineView,
    setOrganicCoplanarMode,
    setOrganicVinylAligned,
    setShowOrganicLabels,
    setEthyleneMode,
    setEthylenePlaneView,
    setBenzeneMode,
    setBenzenePlaneView,
    setAcetyleneMode,
    setAcetyleneLineView,
  };
}
