import { AssetImage } from "@/app/components/AssetImage";
import { assetManifestVersion } from "@/lib/assets/manifest";

export default function AssetEngineeringPage() {
  return (
    <main className="shell">
      <p className="eyebrow">GAME04 · ENGINEERING</p>
      <h1 className="engineering-title">Asset delivery</h1>
      <p className="lede">商品仕様に依存しない配信・読み込み・フォールバック確認用です。</p>
      <p className="notice">Manifest schema v{assetManifestVersion()}</p>
      <section className="asset-grid" aria-label="中立アセット検証">
        <article className="card">
          <h2>Lazy versioned asset</h2>
          <AssetImage assetId="system.sample.tile" alt="中立的な配信確認用図形" className="asset-preview asset-wide" />
        </article>
        <article className="card">
          <h2>Unknown ID fallback</h2>
          <AssetImage assetId="system.unknown.fixture" alt="不明IDの代替画像" className="asset-preview" />
        </article>
      </section>
    </main>
  );
}
