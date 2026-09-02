import { MaintenanceNotice } from "@/app/components/ApplicationAvailability";
import { readApplicationAvailability } from "@/lib/operations/server";

export default async function OperationsPage() {
  const availability = await readApplicationAvailability();
  return (
    <main className="shell">
      <p className="eyebrow">ENGINEERING · OPERATIONS</p>
      <h1 className="engineering-title">運用状態</h1>
      <section className="card" data-current-operational-state={availability.state}>
        <h2>現在のアプリ状態</h2>
        <p>{availability.state}（取得元: {availability.source}）</p>
        <p>この画面には管理用の秘密情報や変更操作を置きません。</p>
      </section>
      <section className="card">
        <h2>メンテナンス表示プレビュー</h2>
        <div className="availability-preview">
          <MaintenanceNotice availability={{ state: "maintenance", messageCode: "system.maintenance", source: "fallback" }} />
        </div>
      </section>
    </main>
  );
}
