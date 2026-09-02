"use client";

import { FormEvent, useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Status = "loading" | "ready" | "sending" | "sent" | "error" | "unavailable";

export function AuthPanel() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

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
    };

    void supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => initializePlayer(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, nextSession: Session | null) => {
      void initializePlayer(nextSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setStatus("sending");
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
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
    await supabase.auth.signOut();
  }

  if (!supabase) {
    return <p className="notice">認証設定を読み込んでいます。Vercel環境値を確認してください。</p>;
  }

  if (session) {
    return (
      <section className="auth-panel" aria-live="polite">
        <p className="notice">{message || "ログイン済みです。"}</p>
        <button className="secondary-action" type="button" onClick={() => void signOut()}>ログアウト</button>
      </section>
    );
  }

  return (
    <form className="auth-panel" onSubmit={signIn}>
      <label htmlFor="email">メールアドレスでログイン</label>
      <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
      <button className="primary-action" type="submit" disabled={status === "loading" || status === "sending"}>
        {status === "sending" ? "送信中…" : "ログインリンクを送信"}
      </button>
      {message && <p className="notice" aria-live="polite">{message}</p>}
    </form>
  );
}
