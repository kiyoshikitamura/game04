import { ObservabilityProbe } from "@/app/components/ObservabilityProbe";

export default function ObservabilityEngineeringPage() {
  return (
    <main className="shell">
      <p className="eyebrow">GAME04 · ENGINEERING</p>
      <h1 className="engineering-title">Observability</h1>
      <p className="lede">技術状態の追跡経路だけを確認します。商品行動の計測画面ではありません。</p>
      <ObservabilityProbe />
    </main>
  );
}
