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
    <main className="game-home-shell">
      <HomePanel accessMode={access.mode} />
    </main>
  );
}
