import http from "node:http";
import { URL } from "node:url";

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

  const url = new URL(request.url ?? "/", "http://localhost");
  const pathname = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";
  const result = resolveApiRequest({ method: request.method, pathname });

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

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number.parseInt(process.env.PORT ?? "", 10) || DEFAULT_PORT;
  const server = createServer();

  server.listen(port, () => {
    console.log(`Chem3D Learn backend listening on http://localhost:${port}`);
  });
}
