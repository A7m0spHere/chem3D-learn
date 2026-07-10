import type { LearningModule } from "@/data/learningModules";

// 下标/上标数字映射为普通数字，让 "H2O" 能搜到 "H₂O"
const SUBSCRIPT_MAP: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
  "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "₊": "+", "₋": "-", "⁺": "+", "⁻": "-",
};

export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹₊₋⁺⁻]/g, (char) => SUBSCRIPT_MAP[char] ?? char)
    .replace(/\s+/g, "");
}

export function moduleMatchesQuery(module: LearningModule, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const haystack = [module.title, module.subtitle, module.formula ?? "", ...module.tags]
    .map(normalizeSearchText)
    .join("\n");
  return haystack.includes(normalizedQuery);
}

export function searchModules(modules: LearningModule[], query: string): LearningModule[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return modules;
  return modules.filter((module) => moduleMatchesQuery(module, query));
}
