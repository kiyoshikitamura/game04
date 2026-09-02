"use client";

import Image from "next/image";
import { useState } from "react";
import { resolveImageAsset, resolveImageFallback } from "@/lib/assets/manifest";

type AssetImageProps = {
  assetId: string;
  alt: string;
  className?: string;
};

export function AssetImage({ assetId, alt, className }: AssetImageProps) {
  const requested = resolveImageAsset(assetId);
  const [failedAssetId, setFailedAssetId] = useState<string | null>(null);
  const resolved = failedAssetId === requested.id ? resolveImageFallback(requested) : requested;

  return (
    <Image
      className={className}
      src={resolved.src}
      alt={alt}
      width={resolved.width}
      height={resolved.height}
      loading={resolved.loading}
      unoptimized
      data-requested-asset-id={assetId}
      data-asset-id={resolved.id}
      onError={() => {
        if (resolved.id === requested.id && resolveImageFallback(requested).id !== requested.id) {
          setFailedAssetId(requested.id);
        }
      }}
    />
  );
}
