import {
  StructureInfoDisclosure,
  type StructureInfoItem,
} from "@/components/learning/StructureInfoDisclosure";
import type { MoleculeRecord, CrystalViewMode } from "@/types/molecule";

type CrystalInfoDisclosureProps = {
  activeMode: CrystalViewMode;
  molecule: MoleculeRecord;
};

const countLabels: Record<string, string> = {
  bdc: "BDC",
  c: "C",
  formulaUnits: "化学式单位",
  n: "N",
  re: "Re",
  sbu: "SBU",
  ti: "Ti",
  voids: "空隙",
  wurtziteS: "纤锌矿 S",
  wurtziteZn: "纤锌矿 Zn",
  zincBlendeS: "闪锌矿 S",
  zincBlendeZn: "闪锌矿 Zn",
};

export function CrystalInfoDisclosure({
  activeMode,
  molecule,
}: CrystalInfoDisclosureProps) {
  const info = molecule.crystal;
  const modeLabel = molecule.crystalControls?.viewModes.find(
    (mode) => mode.id === activeMode,
  )?.labelZh ?? "晶体观察";

  if (!info) {
    return (
      <StructureInfoDisclosure
        facts={[
          { label: "当前模式", value: modeLabel },
          { label: "结构概览", value: molecule.summaryZh },
        ]}
        summaryItems={[
          { label: "晶体", value: molecule.nameZh },
          { label: "模式", value: modeLabel },
        ]}
        title="晶体信息"
      />
    );
  }

  const countSummary = Object.entries(info.unitCellCount)
    .map(([key, value]) => `${countLabels[key] ?? key} ${value}`)
    .join("、");
  const facts: StructureInfoItem[] = [
    { label: "晶体类型", value: info.typeZh },
    { label: "晶格 / 模型", value: info.latticeZh },
    { label: "配位关系", value: info.coordination },
    ...(countSummary ? [{ label: "晶胞计数", value: countSummary }] : []),
    { label: "组成 / 计数说明", value: info.formulaExplanationZh },
  ];

  return (
    <StructureInfoDisclosure
      facts={facts}
      summaryItems={[
        { label: "类型", value: info.typeZh },
        { label: "模式", value: modeLabel },
        { label: "配位", value: info.coordination },
      ]}
      title="晶体信息"
    />
  );
}
