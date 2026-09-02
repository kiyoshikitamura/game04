import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { validateAssetManifest } from "./lib/asset-manifest.mjs";

const root = process.cwd();
const manifestPath = path.join(root, "public", "assets", "manifest.v1.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const errors = validateAssetManifest(manifest);

for (const asset of manifest.assets ?? []) {
  if (typeof asset.src !== "string" || !asset.src.startsWith("/")) continue;
  try {
    await access(path.join(root, "public", ...asset.src.slice(1).split("/")));
  } catch {
    errors.push(`${asset.id ?? "unknown asset"} source file is missing`);
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`asset manifest: ${error}`);
  process.exitCode = 1;
} else {
  console.log(`${manifest.assets.length} versioned assets passed manifest validation.`);
}
