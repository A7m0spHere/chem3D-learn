/* global Buffer */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

const pagesBase = "/chem3D-learn/";
const productionUrl = "https://a7m0sphere.github.io/chem3D-learn/";

test("builds assets and router URLs under the GitHub Pages repository base", async () => {
  const indexHtml = await readFile(new URL("../../dist/index.html", import.meta.url), "utf8");

  assert.match(indexHtml, /(?:src|href)="\/chem3D-learn\/assets\//);
  assert.ok(indexHtml.includes(`content="${productionUrl}"`));
  assert.ok(indexHtml.includes(`href="${productionUrl}"`));
  assert.ok(indexHtml.includes("__spa"));
});

test("ships a 404 redirect that preserves direct SPA navigation", async () => {
  const fallbackHtml = await readFile(new URL("../../dist/404.html", import.meta.url), "utf8");

  assert.ok(fallbackHtml.includes(`const repoBase = "${pagesBase.slice(0, -1)}"`));
  assert.ok(fallbackHtml.includes("__spa"));
  assert.ok(fallbackHtml.includes("window.location.replace(destination)"));
});

test("includes the social preview image in the Pages artifact", async () => {
  const socialImage = await readFile(new URL("../../dist/og.png", import.meta.url));

  assert.ok(socialImage.length > 100_000);
  assert.deepEqual(socialImage.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
});
