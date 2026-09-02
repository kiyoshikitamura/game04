import Link from "next/link";
import { AuthPanel } from "./components/AuthPanel";

export default function TitlePage() {
  return (
    <main className="shell title-shell">
      <p className="eyebrow">GAME04 · BASE ENVIRONMENT</p>
      <h1>GAME04</h1>
      <p className="lede">キャラクターを推し、同じ感覚を持つ人と一緒に活動するためのゲーム。</p>
      <AuthPanel />
      <Link className="primary-action" href="/home">開発用ホームへ</Link>
      <p className="notice">認証後、GAME04共通のプレイヤー状態だけを安全に初期化します。</p>
    </main>
  );
}
