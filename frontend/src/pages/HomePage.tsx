import { ArrowRight, Eye, Layers3, MousePointer2, Orbit, Shapes, Sparkles } from "lucide-react";
import { ModuleCard } from "@/components/home/ModuleCard";
import { Button } from "@/components/ui/button";
import { mockMolecules } from "@/data/mockMolecules";

const learningFlow = [
  {
    icon: <MousePointer2 className="h-5 w-5" aria-hidden="true" />,
    title: "选择结构",
    description: "从 CH4、NH3、H2O、CO2、BF3 和 NaCl 简化示意开始。",
  },
  {
    icon: <Eye className="h-5 w-5" aria-hidden="true" />,
    title: "观察空间",
    description: "在大视图区对照原子、键、键角和孤电子对标记。",
  },
  {
    icon: <Layers3 className="h-5 w-5" aria-hidden="true" />,
    title: "跟随步骤",
    description: "按步骤理解中心原子、空间构型和关键易错点。",
  },
];

const modules = [
  {
    icon: <Shapes className="h-5 w-5" aria-hidden="true" />,
    title: "分子构型",
    description: "观察直线形、平面三角形、正四面体等基础空间构型。",
  },
  {
    icon: <Sparkles className="h-5 w-5" aria-hidden="true" />,
    title: "键角与孤电子对",
    description: "对比 NH3 和 H2O，理解孤电子对对键角的影响。",
  },
  {
    icon: <Orbit className="h-5 w-5" aria-hidden="true" />,
    title: "简化晶体示意",
    description: "用 NaCl 配位环境建立晶体空间关系的初步直觉。",
  },
];

type HomePageProps = {
  onStartLearning: (moleculeId?: string) => void;
};

export function HomePage({ onStartLearning }: HomePageProps) {
  return (
    <main className="min-h-[calc(100vh-65px)] bg-background">
      <section className="border-b border-border bg-gradient-to-b from-white to-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold text-primary">高中结构化学 · 3D 学习</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-text-primary sm:text-5xl">
              Chem3D Learn
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
              用清晰的空间示意、简短中文讲解和分步观察，帮助学生理解分子构型、键角变化和基础晶体关系。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => onStartLearning()}>
                进入 3D 结构学习
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => onStartLearning("ch4")}>
                查看 CH4 示例
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 shadow-panel">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">首批核心模型</h2>
                <p className="mt-1 text-sm text-text-secondary">点击进入对应学习步骤</p>
              </div>
              <span className="rounded-md bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary-dark">
                {mockMolecules.length} 个模型
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {mockMolecules.map((molecule) => (
                <button
                  key={molecule.id}
                  className="rounded-md border border-border bg-background p-4 text-left transition-colors hover:border-primary hover:bg-white"
                  onClick={() => onStartLearning(molecule.id)}
                  type="button"
                >
                  <span className="block text-2xl font-bold text-primary-dark">{molecule.formula}</span>
                  <span className="mt-1 block text-sm font-medium text-text-primary">{molecule.nameZh}</span>
                  <span className="mt-2 block text-xs text-text-secondary">{molecule.geometryZh}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {learningFlow.map((item) => (
            <ModuleCard
              key={item.title}
              description={item.description}
              icon={item.icon}
              title={item.title}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {modules.map((item) => (
            <ModuleCard
              key={item.title}
              description={item.description}
              icon={item.icon}
              title={item.title}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
