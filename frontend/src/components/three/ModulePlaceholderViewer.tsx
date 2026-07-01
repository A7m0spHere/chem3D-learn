import { Box, Orbit, Hexagon, Layers } from "lucide-react";
import type { ModuleCategory } from "@/data/learningModules";

type ModulePlaceholderViewerProps = {
  category: ModuleCategory;
  visualFocus: string;
};

export function ModulePlaceholderViewer({ category, visualFocus }: ModulePlaceholderViewerProps) {
  const getCategoryConfig = () => {
    switch (category) {
      case "molecular-geometry":
        return { icon: Orbit, label: "分子骨架结构分析", color: "text-blue-500", bg: "bg-blue-50" };
      case "crystal-structure":
        return { icon: Box, label: "晶胞空间点阵解析", color: "text-emerald-500", bg: "bg-emerald-50" };
      case "organic-stereochemistry":
        return { icon: Hexagon, label: "碳骨架立体构象", color: "text-amber-500", bg: "bg-amber-50" };
      case "bonding-orbitals":
        return { icon: Layers, label: "轨道重叠与电子云", color: "text-purple-500", bg: "bg-purple-50" };
      default:
        return { icon: Layers, label: "空间结构辅助", color: "text-slate-500", bg: "bg-slate-50" };
    }
  };

  const config = getCategoryConfig();
  const Icon = config.icon;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-white/50 p-8 text-center backdrop-blur-sm relative overflow-hidden group">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 transition-opacity group-hover:opacity-100" />
      
      {/* Central 3D illusion icon */}
      <div className={`relative mb-6 flex h-32 w-32 items-center justify-center rounded-full ${config.bg} shadow-inner transition-transform duration-700 group-hover:scale-110`}>
        <div className="absolute inset-0 rounded-full border-4 border-white opacity-50" />
        <Icon className={`h-16 w-16 ${config.color} animate-pulse`} strokeWidth={1.5} />
        {/* Orbit lines */}
        <div className="absolute inset-0 rounded-full border border-current opacity-20 transform rotate-45 scale-125" />
        <div className="absolute inset-0 rounded-full border border-current opacity-20 transform -rotate-45 scale-125" />
      </div>

      <div className="relative z-10">
        <h3 className="mb-2 text-xl font-bold text-text-primary">
          3D 交互容器
        </h3>
        <p className="mb-6 text-sm font-medium text-text-secondary">
          {config.label}
        </p>

        <div className="inline-flex max-w-sm flex-col rounded-xl border border-border bg-white p-4 shadow-sm text-left">
          <div className="text-xs font-bold text-primary-dark mb-1">观察重点</div>
          <p className="text-sm text-text-primary leading-relaxed">
            {visualFocus || "使用鼠标旋转和缩放，观察各个原子的空间排布和角度关系。"}
          </p>
        </div>
      </div>
    </div>
  );
}
