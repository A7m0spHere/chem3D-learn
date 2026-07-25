import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { createServer } from "../src/server.js";

// 单元测试（api.test.js）只断言纯函数 resolveApiRequest，绕过了真实 HTTP 层：
// 服务器启动、request.url 解析、状态码/头部写出全部零覆盖。两个 P0 缺陷
// （npm start 不监听、畸形 URL 崩溃）正是藏在这一层。这里用 createServer()
// 起真实服务器 + fetch，补齐从 socket 到响应的端到端路径。

describe("Chem3D Learn readonly API (real HTTP)", () => {
  /** @type {import("node:http").Server} */
  let server;
  /** @type {string} */
  let baseUrl;

  before(async () => {
    server = createServer({ corsOrigin: "http://127.0.0.1:5173" });
    // port 0 让内核分配空闲端口，避免与本机其他服务冲突，也验证了 listen 真的生效。
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    assert.ok(address && typeof address === "object", "server should be listening on a TCP port");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it("actually listens and serves /health over HTTP", async () => {
    const response = await fetch(`${baseUrl}/health`);

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");

    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.scope, "mvp-readonly-api");
  });

  it("lists structures through the real server", async () => {
    const response = await fetch(`${baseUrl}/api/molecules`);

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(
      body.data.map((item) => item.id),
      ["ch4", "nh3", "h2o", "co2", "bf3", "nacl"],
    );
  });

  it("returns molecule details through the real server", async () => {
    const response = await fetch(`${baseUrl}/api/structures/nacl`);

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.data.id, "nacl");
    assert.equal(body.data.category, "crystal");
  });

  it("returns 400 for a malformed percent-encoding without crashing (P0)", async () => {
    // `/%` 会让 decodeURIComponent 抛 URIError；修复前这会终止整个进程。
    const response = await fetch(`${baseUrl}/%`);

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, "MALFORMED_REQUEST_URL");
  });

  it("returns 400 for an invalid percent sequence without crashing (P0)", async () => {
    const response = await fetch(`${baseUrl}/%zz`);

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, "MALFORMED_REQUEST_URL");
  });

  it("returns 400 for a network-path request target without crashing (P0)", async () => {
    // `//` 会让 new URL(url, base) 抛 TypeError；同样属于会打崩进程的畸形输入。
    const response = await fetch(`${baseUrl}//`);

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, "MALFORMED_REQUEST_URL");
  });

  it("stays alive and keeps serving after malformed requests", async () => {
    // 连打三个畸形请求后，正常请求仍应成功 —— 证明进程没有被打崩。
    await fetch(`${baseUrl}/%`).catch(() => {});
    await fetch(`${baseUrl}//`).catch(() => {});
    await fetch(`${baseUrl}/%zz`).catch(() => {});

    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
  });

  it("sends the configured CORS headers on API responses", async () => {
    const response = await fetch(`${baseUrl}/api/molecules`);

    assert.equal(response.headers.get("access-control-allow-origin"), "http://127.0.0.1:5173");
    assert.equal(response.headers.get("access-control-allow-methods"), "GET, OPTIONS");
    assert.equal(response.headers.get("vary"), "Origin");
  });

  it("answers CORS preflight (OPTIONS) with 204 and no body", async () => {
    const response = await fetch(`${baseUrl}/api/molecules`, { method: "OPTIONS" });

    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), "http://127.0.0.1:5173");
    const body = await response.text();
    assert.equal(body, "");
  });

  it("rejects non-GET methods with 405 through the real server", async () => {
    const response = await fetch(`${baseUrl}/api/molecules`, { method: "POST" });

    assert.equal(response.status, 405);
    const body = await response.json();
    assert.equal(body.error.code, "METHOD_NOT_ALLOWED");
  });
});
