/* global Request, Response, URL, process */

import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const frontendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const clientRoot = path.join(frontendRoot, "dist", "client");
const workerUrl = pathToFileURL(
  path.join(frontendRoot, "dist", "server", "index.js"),
);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
]);

const assets = {
  async fetch(request) {
    const url = new URL(request.url);
    const relativePath =
      url.pathname === SPA_ENTRY_PATH
        ? "index.html"
        : decodeURIComponent(url.pathname).replace(/^\/+/, "");
    const assetPath = path.resolve(clientRoot, relativePath);
    const relativeToClient = path.relative(clientRoot, assetPath);

    if (
      !relativePath ||
      relativeToClient.startsWith("..") ||
      path.isAbsolute(relativeToClient)
    ) {
      return new Response("Not found", { status: 404 });
    }

    try {
      const assetStat = await stat(assetPath);
      if (!assetStat.isFile()) {
        return new Response("Not found", { status: 404 });
      }

      const body = request.method === "HEAD" ? null : await readFile(assetPath);
      return new Response(body, {
        headers: {
          "content-type":
            contentTypes.get(path.extname(assetPath)) ??
            "application/octet-stream",
        },
        status: 200,
      });
    } catch (error) {
      if (error?.code === "ENOENT") {
        return new Response("Not found", { status: 404 });
      }
      throw error;
    }
  },
};

const SPA_ENTRY_PATH = "/index.html";

async function fetchFromWorker(pathname, init = {}) {
  return worker.fetch(
    new Request(`https://chem3d-learn.test${pathname}`, init),
    { ASSETS: assets },
  );
}

test("serves the SPA entry for direct navigation to every route family", async () => {
  const routes = [
    "/",
    "/modules",
    "/module/pyramidal-nh3",
    "/lab/organic-builder/ethylene-planar",
    "/exam/molecular-geometry",
  ];

  for (const route of routes) {
    const response = await fetchFromWorker(route, {
      headers: { accept: "text/html" },
    });

    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    assert.match(await response.text(), /<div id="root"><\/div>/);
  }
});

test("serves built assets without replacing them with the SPA entry", async () => {
  const assetNames = await readdir(path.join(clientRoot, "assets"));
  const scriptName = assetNames.find((name) => name.endsWith(".js"));
  assert.ok(scriptName, "expected at least one built JavaScript asset");

  const response = await fetchFromWorker(`/assets/${scriptName}`, {
    headers: { accept: "*/*" },
  });

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/javascript\b/i,
  );
});

test("preserves real 404 responses for missing assets and non-navigation requests", async () => {
  const missingAsset = await fetchFromWorker("/assets/missing.js", {
    headers: { accept: "*/*" },
  });
  assert.equal(missingAsset.status, 404);

  const postNavigation = await fetchFromWorker("/modules", {
    headers: { accept: "text/html" },
    method: "POST",
  });
  assert.equal(postNavigation.status, 404);
});
