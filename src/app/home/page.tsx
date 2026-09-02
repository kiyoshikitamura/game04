import Link from "next/link";
import { redirect } from "next/navigation";
import { HomePanel } from "./HomePanel";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { decideProtectedRouteAccess } from "@/lib/auth/route-access";

export default async function HomePage() {
  const supabase = await getSupabaseServerClient();
  const authResult = supabase ? await supabase.auth.getUser() : null;
  const access = decideProtectedRouteAccess({
    configured: Boolean(supabase),
    userId: authResult?.data.user?.id,
    authError: Boolean(authResult?.error),
  });

  if (access.mode === "redirect") {
    redirect(`/?reason=${access.reason}&next=/home`);
  }

  return (
    <main className="shell">
      <p className="eyebrow">GAME04 · PLACEHOLDER</p>
      <h1>Home</h1>
      <HomePanel accessMode={access.mode} />
      <section className="card"><h2>Character</h2><p>キャラクター、推し、覚醒、SupportはGAME04固有の仕様確定後に実装します。</p></section>
      <section className="card"><h2>Community</h2><p>Guild／Community／Shared Goalは、競争機能を前提にせず設計します。</p></section>
      <Link href="/">タイトルへ戻る</Link>
    </main>
  );
}
