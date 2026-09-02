import assert from "node:assert/strict";
import { test } from "node:test";
import manifest from "../../public/assets/manifest.v1.json" with { type: "json" };
import { validateAssetManifest } from "../../scripts/lib/asset-manifest.mjs";
import { resolveImageAsset, resolveImageFallback } from "../../src/lib/assets/manifest.ts";

test("committed asset manifest satisfies the delivery contract", () => {
  assert.deepEqual(validateAssetManifest(manifest), []);
});

test("unknown asset IDs resolve to the global neutral fallback", () => {
  assert.equal(resolveImageAsset("system.missing").id, manifest.fallbackAssetId);
  assert.equal(resolveImageFallback(resolveImageAsset("system.sample.tile")).id, manifest.fallbackAssetId);
});

test("duplicate IDs and fallback cycles are rejected", () => {
  const invalid = {
    schemaVersion: 1,
    fallbackAssetId: "system.a",
    assets: [
      { id: "system.a", kind: "image", src: "/assets/versioned/a-v1.svg", mediaType: "image/svg+xml", width: 1, height: 1, loading: "eager", cache: "immutable", fallbackId: "system.b" },
      { id: "system.a", kind: "image", src: "/assets/versioned/b-v1.svg", mediaType: "image/svg+xml", width: 1, height: 1, loading: "lazy", cache: "immutable", fallbackId: "system.a" },
    ],
  };
  const errors = validateAssetManifest(invalid);
  assert.equal(errors.some((error) => error.includes("duplicate asset id")), true);
  assert.equal(errors.some((error) => error.includes("fallback")), true);
});
