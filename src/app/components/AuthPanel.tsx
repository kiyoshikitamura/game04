"use client";

import { FormEvent, useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ConfirmDialog } from "./ConfirmDialog";
import { LifecycleState } from "./LifecycleState";

type Status = "loading" | "ready" | "sending" | "sent" | "error" | "unavailable";

type AuthPanelProps = {
  nextPath: string;
};

export function AuthPanel({ nextPath }: AuthPanelProps) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;
    const initializePlayer = async (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);

      if (!nextSession) {
        setStatus("ready");
        return;
      }

      const { error } = await supabase.rpc("initialize_current_player");
      if (!active) return;
      setStatus(error ? "error" : "ready");
      setMessage(error ? "プレイヤー初期化に失敗しました。時間をおいて再試行してください。" : "ログイン済みです。");
      if (!error) router.replace(nextPath);
    };

    void supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => initializePlayer(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, nextSession: Session | null) => {
      void initializePlayer(nextSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [nextPath, router, supabase]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setStatus("sending");
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` },
    });

    if (error) {
      setStatus("error");
      setMessage("ログインメールを送信できませんでした。メールアドレスと認証設定を確認してください。");
      return;
    }

    setStatus("sent");
    setMessage("ログイン用リンクをメールへ送信しました。");
  }

  async function signOut() {
    if (!supabase) return;
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    setSigningOut(false);
    setConfirmingSignOut(false);
    if (error) {
      setStatus("error");
      setMessage("ログアウトできませんでした。時間をおいて再試行してください。");
    }
  }

  if (!supabase) {
    return <LifecycleState kind="unavailable" title="認証設定を読み込んでいます。" message="接続設定後にメールログインを利用できます。" compact />;
  }

  if (status === "loading") {
    return <LifecycleState kind="loading" title="ログイン状態を確認しています。" compact />;
  }

  if (session) {
    return (
      <>
        <section className="auth-panel" aria-live="polite">
          <p className="notice">{message || "ログイン済みです。"}</p>
          <button className="secondary-action" type="button" onClick={() => setConfirmingSignOut(true)}>ログアウト</button>
        </section>
        <ConfirmDialog
          open={confirmingSignOut}
          title="ログアウトしますか？"
          description="この端末のログイン状態を終了します。"
          confirmLabel="ログアウト"
          busy={signingOut}
          onConfirm={() => void signOut()}
          onCancel={() => setConfirmingSignOut(false)}
        />
      </>
    );
  }

  return (
    <form className="auth-panel" onSubmit={signIn}>
      <label htmlFor="email">メールアドレスでログイン</label>
      <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
      <button className="primary-action" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "送信中…" : "ログインリンクを送信"}
      </button>
      {message && <LifecycleState kind={status === "error" ? "error" : "notice"} title={message} compact />}
    </form>
  );
}
