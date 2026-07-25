import http from "node:http";
import { URL, pathToFileURL } from "node:url";

import { findMoleculeById, getMoleculeSummaries, listSupportedIds } from "./molecules.js";

const DEFAULT_PORT = 4000;

/**
 * @param {unknown} payload
 * @param {number} statusCode
 * @param {http.ServerResponse} response
 */
function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Connection": "close"
  });
  response.end(body);
}

/**
 * @param {http.ServerResponse} response
 * @param {string} corsOrigin
 */
function setCorsHeaders(response, corsOrigin) {
  response.setHeader("Access-Control-Allow-Origin", corsOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Vary", "Origin");
}

/**
 * 把原始 `request.url` 解析成用于路由的 pathname。
 *
 * `request.url` 完全由客户端控制，Node 的 HTTP 解析器不会替我们校验它：
 * - `/%`、`/%zz` 会让 `decodeURIComponent` 抛 `URIError`
 * - `//`、`///` 会让 `new URL` 抛 `TypeError`
 *
 * 这两类异常都必须在这里收敛成一个可返回的结果。否则它们会冒泡成未捕获异常，
 * 直接终止整个 Node 进程 —— 任何人一条请求就能打掉课堂后端。
 *
 * @param {string} requestUrl
 * @returns {{ pathname: string; malformed?: false } | { pathname?: undefined; malformed: true }}
 */
export function parseRequestPathname(requestUrl) {
  try {
    const url = new URL(requestUrl, "http://localhost");
    // 解码后去掉结尾斜杠，让 `/health/` 与 `/health` 命中同一路由。
    const pathname = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";
    return { pathname };
  } catch {
    return { malformed: true };
  }
}

/**
 * @param {{ method?: string; pathname: string }} request
 * @returns {{ statusCode: number; payload?: unknown; empty?: boolean }}
 */
export function resolveApiRequest({ method = "GET", pathname }) {
  if (method === "OPTIONS") {
    return { statusCode: 204, empty: true };
  }

  if (method !== "GET") {
    return {
      statusCode: 405,
      payload: {
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "当前 API 只支持 GET 请求。"
        }
      }
    };
  }

  if (pathname === "/health") {
    return {
      statusCode: 200,
      payload: {
        ok: true,
        service: "chem3d-learn-backend",
        scope: "mvp-readonly-api"
      }
    };
  }

  if (pathname === "/api/molecules" || pathname === "/api/structures") {
    return {
      statusCode: 200,
      payload: {
        data: getMoleculeSummaries()
      }
    };
  }

  const moleculeMatch = pathname.match(/^\/api\/(?:molecules|structures)\/([a-z0-9-]+)$/i);
  if (moleculeMatch) {
    const molecule = findMoleculeById(moleculeMatch[1]);

    if (!molecule) {
      return {
        statusCode: 404,
        payload: {
          error: {
            code: "MOLECULE_NOT_FOUND",
            message: "未找到对应的结构教学数据。",
            supportedIds: listSupportedIds()
          }
        }
      };
    }

    return {
      statusCode: 200,
      payload: {
        data: molecule
      }
    };
  }

  return {
    statusCode: 404,
    payload: {
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "未找到 API 路由。"
      }
    }
  };
}

/**
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {{ corsOrigin?: string }} [options]
 */
export function handleRequest(request, response, options = {}) {
  const corsOrigin = options.corsOrigin ?? process.env.CORS_ORIGIN ?? "*";
  setCorsHeaders(response, corsOrigin);

  const parsed = parseRequestPathname(request.url ?? "/");

  if (parsed.malformed) {
    sendJson(response, 400, {
      error: {
        code: "MALFORMED_REQUEST_URL",
        message: "请求地址格式无效。"
      }
    });
    return;
  }

  const result = resolveApiRequest({ method: request.method, pathname: parsed.pathname });

  if (result.empty) {
    response.writeHead(result.statusCode);
    response.end();
    return;
  }

  sendJson(response, result.statusCode, result.payload);
}

/**
 * @param {{ corsOrigin?: string }} [options]
 */
export function createServer(options = {}) {
  return http.createServer((request, response) => handleRequest(request, response, options));
}

// 只在被直接执行时监听端口；被 import（测试）时不启动服务。
// 不要写成 `file://${process.argv[1]}`：Windows 的 argv[1] 是 `D:\...\server.js`，
// 拼出的 `file://D:\...` 与 `import.meta.url` 的 `file:///D:/...` 永不相等，
// 于是 `npm start` 不会监听任何端口。路径含空格或中文时同样失配（需要 URL 编码）。
// `pathToFileURL` 负责盘符、分隔符和百分号编码，是唯一可靠的比较方式。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number.parseInt(process.env.PORT ?? "", 10) || DEFAULT_PORT;
  const server = createServer();

  // 监听失败（如端口被占用）应给出明确信息并以非零码退出，而不是抛未捕获异常。
  server.on("error", (error) => {
    console.error(`Chem3D Learn backend failed to start on port ${port}:`, error.message);
    process.exitCode = 1;
  });

  server.listen(port, () => {
    console.log(`Chem3D Learn backend listening on http://localhost:${port}`);
  });
}
