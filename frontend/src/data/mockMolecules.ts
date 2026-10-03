import type { MoleculeRecord } from "@/types/molecule";

// ---------------------------------------------------------------------------
// 手写结构数据加载器
//
// 23 份 JSON 通过 import.meta.glob 按需加载：ModuleDetailPage 只下载当前
// 模块的一份 JSON（5-10KB），而不是把全部结构打包进页面 chunk
//（体检第二梯队：ModuleDetailPage chunk 165KB → 约 40KB）。
//
// 新增分子：创建 frontend/src/data/manual/<id>.json 即自动生效，无需注册。
// JSON imports 失去元组类型（position 变为 number[]），`as MoleculeRecord`
// 桥接是有意为之；如继续膨胀可加运行时校验（如 Zod）。
// ---------------------------------------------------------------------------

// pattern 用 root 绝对路径：dev 与 build 下 keys 均为 "/src/data/manual/<id>.json"，
// 相对 pattern 在 dev 下会返回模块相对 key，导致加载器查不到（体检第二梯队实测）。
const jsonLoaders = import.meta.glob<{ default: MoleculeRecord }>("/src/data/manual/*.json");

/** vsepr 分子的空间构型短语（JSON 无对应字段）；晶体分子走 crystal.typeZh。 */
const GEOMETRY_ZH_BY_ID: Record<string, string> = {
  ch4: "正四面体形",
  nh3: "三角锥形",
  h2o: "V 形",
  co2: "直线形",
  bf3: "平面三角形",
  nacl: "面心立方 / 六配位",
  cscl: "简单立方 / 八配位",
  "sodium-metal": "体心立方 / BCC",
  diamond: "金刚石型 / 四配位",
};

/** 空间构型展示值：vsepr 查表，晶体用 crystal.typeZh，兜底「晶体结构」。 */
export function moleculeGeometryZh(record: MoleculeRecord): string {
  return GEOMETRY_ZH_BY_ID[record.id] ?? record.crystal?.typeZh ?? "晶体结构";
}

/** 按分子 id 懒加载手写结构数据；未知 id 返回 undefined。 */
export async function loadMoleculeData(id: string): Promise<MoleculeRecord | undefined> {
  const loader = jsonLoaders[`/src/data/manual/${id}.json`];
  if (!loader) return undefined;
  const module = await loader();
  return module.default;
}
