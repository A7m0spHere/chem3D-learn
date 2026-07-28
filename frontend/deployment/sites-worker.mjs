/* global Request, Response, URL */

const SPA_ENTRY_PATH = "/index.html";

function shouldServeSpaEntry(request, response) {
  if (response.status !== 404 || !["GET", "HEAD"].includes(request.method)) {
    return false;
  }

  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/html");
}

function createSpaEntryRequest(request) {
  const entryUrl = new URL(request.url);
  entryUrl.pathname = SPA_ENTRY_PATH;
  entryUrl.search = "";

  return new Request(entryUrl, {
    headers: request.headers,
    method: request.method,
  });
}

export default {
  async fetch(request, env) {
    if (!env?.ASSETS?.fetch) {
      return new Response("Static asset binding unavailable", { status: 500 });
    }

    const response = await env.ASSETS.fetch(request);
    if (!shouldServeSpaEntry(request, response)) {
      return response;
    }

    return env.ASSETS.fetch(createSpaEntryRequest(request));
  },
};
