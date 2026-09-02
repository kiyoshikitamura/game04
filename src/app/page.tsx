import Link from "next/link";
import { AuthPanel } from "./components/AuthPanel";
import { LifecycleState } from "./components/LifecycleState";
import { authNavigationMessage, safeInternalPath } from "@/lib/auth/navigation";

type TitlePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TitlePage({ searchParams }: TitlePageProps) {
  const params = await searchParams;
  const message = authNavigationMessage(first(params.reason));
  const nextPath = safeInternalPath(first(params.next), "/home");

  return (
    <main className="shell title-shell">
      <p className="eyebrow">GAME04 · BASE ENVIRONMENT</p>
      <h1>GAME04</h1>
      <p className="lede">キャラクターを推し、同じ感覚を持つ人と一緒に活動するためのゲーム。</p>
      {message && <LifecycleState kind="notice" title="ログイン状態のお知らせ" message={message} compact />}
      <AuthPanel nextPath={nextPath} />
      <Link className="primary-action" href="/home">開発用ホームへ</Link>
      <p className="notice">認証後、GAME04共通のプレイヤー状態だけを安全に初期化します。</p>
    </main>
  );
}
