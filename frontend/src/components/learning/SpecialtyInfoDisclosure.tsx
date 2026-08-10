import {
  StructureInfoDisclosure,
  type StructureInfoItem,
} from "@/components/learning/StructureInfoDisclosure";

type SpecialtyInfoDisclosureProps = {
  extraFacts?: StructureInfoItem[];
  identity: string;
  mode: string;
  modelBoundary: string;
  state: string;
  structureType: string;
};

export function SpecialtyInfoDisclosure({
  extraFacts = [],
  identity,
  mode,
  modelBoundary,
  state,
  structureType,
}: SpecialtyInfoDisclosureProps) {
  return (
    <StructureInfoDisclosure
      facts={[
        { label: "结构 / 轨道类型", value: structureType },
        { label: "当前模式", value: mode },
        { label: "关键状态", value: state },
        ...extraFacts,
      ]}
      modelBoundary={modelBoundary}
      summaryItems={[
        { label: "模块", value: identity },
        { label: "模式", value: mode },
        { label: "状态", value: state },
      ]}
      title="模型信息"
    />
  );
}
