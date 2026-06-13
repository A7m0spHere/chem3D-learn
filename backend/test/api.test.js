import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveApiRequest } from "../src/server.js";

describe("Chem3D Learn readonly API", () => {
  it("returns a health response", () => {
    const response = resolveApiRequest({ pathname: "/health" });

    assert.equal(response.statusCode, 200);
    assert.equal(response.payload.ok, true);
    assert.equal(response.payload.scope, "mvp-readonly-api");
  });

  it("lists the six MVP structures", () => {
    const response = resolveApiRequest({ pathname: "/api/molecules" });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(
      response.payload.data.map((item) => item.id),
      ["ch4", "nh3", "h2o", "co2", "bf3", "nacl"]
    );
  });

  it("returns molecule details by id", () => {
    const response = resolveApiRequest({ pathname: "/api/molecules/bf3" });

    assert.equal(response.statusCode, 200);
    assert.equal(response.payload.data.id, "bf3");
    assert.equal(response.payload.data.formula, "BF3");
    assert.equal(response.payload.data.keyAngles[0].label, "约 120°");
  });

  it("returns a supported-id list for missing molecules", () => {
    const response = resolveApiRequest({ pathname: "/api/molecules/benzene" });

    assert.equal(response.statusCode, 404);
    assert.equal(response.payload.error.code, "MOLECULE_NOT_FOUND");
    assert.ok(response.payload.error.supportedIds.includes("nacl"));
  });

  it("supports structures route aliases", () => {
    const response = resolveApiRequest({ pathname: "/api/structures/nacl" });

    assert.equal(response.statusCode, 200);
    assert.equal(response.payload.data.id, "nacl");
    assert.equal(response.payload.data.category, "crystal");
  });
});
