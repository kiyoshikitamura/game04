import rawManifest from "../../../public/assets/manifest.v1.json" with { type: "json" };

export type AssetLoadingPolicy = "eager" | "lazy";

export type ImageAsset = {
  id: string;
  kind: "image";
  src: string;
  mediaType: string;
  width: number;
  height: number;
  loading: AssetLoadingPolicy;
  cache: "immutable";
  fallbackId: string | null;
};

type AssetManifest = {
  schemaVersion: 1;
  fallbackAssetId: string;
  assets: ImageAsset[];
};

const manifest = rawManifest as AssetManifest;
const assetsById = new Map(manifest.assets.map((asset) => [asset.id, asset]));
const fallbackEntry = assetsById.get(manifest.fallbackAssetId);

if (!fallbackEntry) throw new Error("Validated asset manifest has no global fallback.");
const globalFallback: ImageAsset = fallbackEntry;

export function resolveImageAsset(assetId: string): ImageAsset {
  return assetsById.get(assetId) ?? globalFallback;
}

export function resolveImageFallback(asset: ImageAsset): ImageAsset {
  return (asset.fallbackId && assetsById.get(asset.fallbackId)) || globalFallback;
}

export function assetManifestVersion() {
  return manifest.schemaVersion;
}
