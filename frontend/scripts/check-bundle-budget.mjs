/* global console, process */
// 3D chunk 体积守卫（体检第三梯队第二批）。
// vite.config.ts 的函数式 manualChunks 把 three 家族隔离为稳定命名的 "three" chunk；
// 本脚本在构建后扫描 dist/assets/*.js，按预算断言体积，超限即退出 1，防止体积悄悄回涨。
// 预算校准基准（2026-10-07 实测）：three 992.1 KB / gzip 275.8 KB；最大非 three chunk
// （首页入口）210.0 KB / gzip 67.4 KB。确认合理增长后可显式上调预算，并在提交说明中记录。
import { readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const assetsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "assets");

/** three 家族 chunk（manualChunks 命名 + 内容 hash）。 */
const THREE_CHUNK_PATTERN = /^three-[^.]+\.js$/;

/** three chunk 体积预算（KB，1024 字节，与 Vite 构建输出同口径）。 */
const THREE_BUDGET_KB = { raw: 1100, gzip: 310 };
/** 其余每个 chunk 的体积预算——首页入口与各页面 chunk 都必须保持轻量。 */
const OTHER_BUDGET_KB = { raw: 260, gzip: 80 };

const KB = 1024;

function formatKb(bytes) {
  return (bytes / KB).toFixed(1);
}

function main() {
  let files;
  try {
    files = readdirSync(assetsDir).filter((name) => name.endsWith(".js"));
  } catch {
    console.error(`[bundle-budget] 找不到 ${assetsDir}，请先运行 vite build。`);
    process.exit(1);
  }
  if (files.length === 0) {
    console.error("[bundle-budget] dist/assets 下没有 JS 产物，构建可能失败。");
    process.exit(1);
  }

  const chunks = files.map((name) => {
    const bytes = readFileSync(path.join(assetsDir, name));
    return { name, raw: bytes.length, gzip: gzipSync(bytes).length };
  });
  const threeChunks = chunks.filter((chunk) => THREE_CHUNK_PATTERN.test(chunk.name));
  const otherChunks = chunks.filter((chunk) => !THREE_CHUNK_PATTERN.test(chunk.name));

  console.log("[bundle-budget] dist/assets/*.js 体积扫描：");
  for (const chunk of [...threeChunks, ...otherChunks].sort((a, b) => b.raw - a.raw).slice(0, 8)) {
    console.log(
      `  ${chunk.name.padEnd(40)} raw ${formatKb(chunk.raw).padStart(8)} KB  gzip ${formatKb(chunk.gzip).padStart(8)} KB`,
    );
  }
  console.log(`  （其余 ${Math.max(otherChunks.length - 8, 0)} 个 chunk 均远小于预算，已省略）`);

  const failures = [];

  if (threeChunks.length !== 1) {
    failures.push(
      `three 家族必须恰好隔离为一个 "three-*.js" chunk（当前 ${threeChunks.length} 个）。` +
        "请检查 vite.config.ts 的 manualChunks 是否被改动。",
    );
  } else {
    const three = threeChunks[0];
    if (three.raw / KB > THREE_BUDGET_KB.raw || three.gzip / KB > THREE_BUDGET_KB.gzip) {
      failures.push(
        `three chunk 超预算：${three.name} raw ${formatKb(three.raw)} KB（预算 ${THREE_BUDGET_KB.raw}）、` +
          `gzip ${formatKb(three.gzip)} KB（预算 ${THREE_BUDGET_KB.gzip}）。`,
      );
    }
  }

  for (const chunk of otherChunks) {
    if (chunk.raw / KB > OTHER_BUDGET_KB.raw || chunk.gzip / KB > OTHER_BUDGET_KB.gzip) {
      failures.push(
        `非 3D chunk 超预算：${chunk.name} raw ${formatKb(chunk.raw)} KB（预算 ${OTHER_BUDGET_KB.raw}）、` +
          `gzip ${formatKb(chunk.gzip)} KB（预算 ${OTHER_BUDGET_KB.gzip}）。` +
          "常见原因是 three / 3D 依赖被非 3D 入口间接引入。",
      );
    }
  }

  if (failures.length > 0) {
    console.error("[bundle-budget] 体积守卫未通过：");
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    console.error("  确认属合理增长后，显式上调 scripts/check-bundle-budget.mjs 的预算并在提交说明中记录。");
    process.exit(1);
  }
  console.log("[bundle-budget] ✓ 体积守卫通过。");
}

main();
