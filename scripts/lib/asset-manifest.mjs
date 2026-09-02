const idPattern = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const versionedPathPattern = /^\/assets\/versioned\/[a-z0-9-]+-v\d+\.(?:svg|png|webp|avif)$/;
const allowedMediaTypes = new Set(["image/svg+xml", "image/png", "image/webp", "image/avif"]);

export function validateAssetManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== "object") return ["manifest must be an object"];
  if (manifest.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (!Array.isArray(manifest.assets) || manifest.assets.length === 0) {
    errors.push("assets must be a non-empty array");
    return errors;
  }

  const ids = new Set();
  const sources = new Set();
  for (const [index, asset] of manifest.assets.entries()) {
    const label = `assets[${index}]`;
    if (!asset || typeof asset !== "object") {
      errors.push(`${label} must be an object`);
      continue;
    }
    if (typeof asset.id !== "string" || !idPattern.test(asset.id)) errors.push(`${label}.id is invalid`);
    else if (ids.has(asset.id)) errors.push(`duplicate asset id: ${asset.id}`);
    else ids.add(asset.id);

    if (asset.kind !== "image") errors.push(`${label}.kind must be image`);
    if (typeof asset.src !== "string" || !versionedPathPattern.test(asset.src)) errors.push(`${label}.src must be a versioned local asset path`);
    else if (sources.has(asset.src)) errors.push(`duplicate asset source: ${asset.src}`);
    else sources.add(asset.src);
    if (!allowedMediaTypes.has(asset.mediaType)) errors.push(`${label}.mediaType is unsupported`);
    if (!Number.isInteger(asset.width) || asset.width <= 0) errors.push(`${label}.width must be a positive integer`);
    if (!Number.isInteger(asset.height) || asset.height <= 0) errors.push(`${label}.height must be a positive integer`);
    if (asset.loading !== "eager" && asset.loading !== "lazy") errors.push(`${label}.loading must be eager or lazy`);
    if (asset.cache !== "immutable") errors.push(`${label}.cache must be immutable`);
    if (asset.fallbackId !== null && typeof asset.fallbackId !== "string") errors.push(`${label}.fallbackId must be an id or null`);
  }

  if (!ids.has(manifest.fallbackAssetId)) errors.push("fallbackAssetId must reference an asset");
  const byId = new Map(manifest.assets.filter((asset) => asset && typeof asset.id === "string").map((asset) => [asset.id, asset]));
  for (const asset of byId.values()) {
    if (asset.fallbackId !== null && !byId.has(asset.fallbackId)) errors.push(`${asset.id} references a missing fallback`);

    const visited = new Set([asset.id]);
    let current = asset;
    while (current?.fallbackId) {
      if (visited.has(current.fallbackId)) {
        errors.push(`${asset.id} has a fallback cycle`);
        break;
      }
      visited.add(current.fallbackId);
      current = byId.get(current.fallbackId);
    }
  }

  return errors;
}
