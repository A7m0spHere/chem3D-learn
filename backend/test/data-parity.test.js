import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { molecules } from "../src/molecules.js";

// ---------------------------------------------------------------------------
// T-005 防漂移契约测试。
//
// 背景：后端 `molecules.js` 手写了 6 条结构，与前端 `frontend/src/data/manual/`
// 的手写 JSON 存在重复。前端手写数据是产品「真源」（见 AGENTS.md / D-001），
// 后端只是只读配套层。既然当前没有构建期数据同步，就需要一道护栏，防止两边
// 「结构核心」在后续编辑中悄悄漂移。
//
// 本测试**不改变**任何被服务的数据，也**不让前端依赖后端**：它只在测试期把前端
// JSON 作为真源读进来，断言后端 5 个 VSEPR 分子的**结构核心**与前端逐字一致。
//
// 契约范围（经核对当前逐字相同的键）：
//   id / kind / formula / names / nameZh / category / atoms / bonds / lonePairs
// 明确排除在契约外（允许两边各自维护、不参与相等断言）：
//   - 教学文案：summaryZh / lessonSteps / keyAngles / rendering / metadata
//     （后端服务的是更精简的课堂文案，前端是完整教学脚本，二者本就不同）
//   - nacl：后端是 15 原子的极简教学晶胞、无 crystalTeaching；前端是 27 原子
//     完整晶胞 + crystalTeaching。这是**有意的教学简化**，不是漂移，
//     因此 nacl 不纳入结构相等契约，仅断言双方都存在、都是 crystal。
//
// 详见 docs/DATA_DEDUP_PLAN.md（T-005 设计）。
// ---------------------------------------------------------------------------

// 参与「结构核心逐字相等」契约的 5 个 VSEPR 分子。
const CONTRACT_IDS = ["ch4", "nh3", "h2o", "co2", "bf3"];

// 结构核心键：这些键在前后端之间必须逐字一致，任一漂移即测试失败。
const CORE_KEYS = [
  "id",
  "kind",
  "formula",
  "names",
  "nameZh",
  "category",
  "atoms",
  "bonds",
  "lonePairs",
];

// nacl 有意简化，只断言存在性与 kind，不断言结构相等。
const DIVERGENT_ID = "nacl";

function loadFrontendRecord(id) {
  const path = fileURLToPath(
    new URL(`../../frontend/src/data/manual/${id}.json`, import.meta.url),
  );
  return JSON.parse(readFileSync(path, "utf8"));
}

function backendRecord(id) {
  return molecules.find((molecule) => molecule.id === id);
}

describe("T-005 前后端结构数据防漂移契约", () => {
  it("后端服务的 6 个 id 与预期一致", () => {
    assert.deepEqual(
      molecules.map((molecule) => molecule.id),
      ["ch4", "nh3", "h2o", "co2", "bf3", "nacl"],
    );
  });

  for (const id of CONTRACT_IDS) {
    it(`${id} 的结构核心与前端 JSON 逐字一致`, () => {
      const frontend = loadFrontendRecord(id);
      const backend = backendRecord(id);
      assert.ok(backend, `后端缺少 ${id}`);

      for (const key of CORE_KEYS) {
        assert.deepEqual(
          backend[key],
          frontend[key],
          `${id}.${key} 在前后端之间漂移了：前端 JSON 是真源，请让后端与之对齐（或在契约里明确排除该键并说明原因）。`,
        );
      }
    });
  }

  it("nacl 是有意的教学简化：双方都存在且为 crystal，但不参与结构相等契约", () => {
    const frontend = loadFrontendRecord(DIVERGENT_ID);
    const backend = backendRecord(DIVERGENT_ID);

    assert.ok(backend, "后端缺少 nacl");
    assert.equal(backend.category, "crystal");
    assert.equal(frontend.category, "crystal");

    // 记录当前的有意差异（后端精简、无 crystalTeaching）。若哪天两边被统一，
    // 这些断言会失败，提醒维护者回来更新契约与 DATA_DEDUP_PLAN.md。
    assert.equal(backend.crystalTeaching, undefined, "后端 nacl 目前有意不含 crystalTeaching");
    assert.ok(frontend.crystalTeaching, "前端 nacl 含完整 crystalTeaching");
    assert.ok(
      backend.atoms.length < frontend.atoms.length,
      "后端 nacl 目前是更精简的教学晶胞（原子数少于前端完整晶胞）",
    );
  });
});
