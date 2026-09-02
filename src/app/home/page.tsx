import Link from "next/link";
import { HomePanel } from "./HomePanel";

export default function HomePage() {
  return (
    <main className="shell">
      <p className="eyebrow">GAME04 · PLACEHOLDER</p>
      <h1>Home</h1>
      <HomePanel />
      <section className="card"><h2>Character</h2><p>キャラクター、推し、覚醒、SupportはGAME04固有の仕様確定後に実装します。</p></section>
      <section className="card"><h2>Community</h2><p>Guild／Community／Shared Goalは、競争機能を前提にせず設計します。</p></section>
      <Link href="/">タイトルへ戻る</Link>
    </main>
  );
}
