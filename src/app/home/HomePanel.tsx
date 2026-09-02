"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { LifecycleState } from "@/app/components/LifecycleState";

type Player = {
  id: string;
  display_name: string | null;
};

type HomePanelProps = {
  accessMode: "offline" | "authenticated";
};

export function HomePanel({ accessMode }: HomePanelProps) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const sawAuthenticatedSession = useRef(false);
  const [session, setSession] = useState<Session | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [saving, setSaving] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (accessMode === "offline" || !supabase) return;

    let active = true;
    const load = async (nextSession: Session | null) => {
      if (!active) return;

      if (!nextSession) {
        const reason = sawAuthenticatedSession.current ? "session-expired" : "session-required";
        router.replace(`/?reason=${reason}&next=/home`);
        return;
      }

      sawAuthenticatedSession.current = true;
      setSession(nextSession);
      setStatus("loading");
      const { data, error } = await supabase
        .from("players")
        .select("id, display_name")
        .eq("id", nextSession.user.id)
        .maybeSingle();

      if (!active) return;
      if (error) {
        setStatus("error");
        return;
      }

      const nextPlayer = data as Player | null;
      setPlayer(nextPlayer);
      setDisplayName(nextPlayer?.display_name ?? "");
      setStatus("ready");
    };

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setStatus("error");
        return;
      }
      void load(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void load(nextSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [accessMode, retryKey, router, supabase]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !session || !player) return;

    setSaving(true);
    setMessage("");
    const normalizedName = displayName.trim() || null;
    const { error } = await supabase.rpc("update_current_player_profile", {
      p_display_name: normalizedName,
    });

    if (error) {
      setSaving(false);
      setMessage("表示名を保存できませんでした。");
      return;
    }

    setPlayer({ ...player, display_name: normalizedName });
    setDisplayName(normalizedName ?? "");
    setSaving(false);
    setMessage("表示名を保存しました。");
  }

  if (accessMode === "offline" || !supabase) {
    return <LifecycleState kind="unavailable" title="ゲーム接続を準備しています。" message="接続設定がなくても画面基盤の開発と確認は継続できます。" />;
  }

  if (status === "loading") {
    return <LifecycleState kind="loading" title="Homeを読み込んでいます。" />;
  }

  if (status === "error") {
    return <LifecycleState kind="error" title="Homeを読み込めませんでした。" message="通信状態を確認して、もう一度お試しください。" actionLabel="再試行" onAction={() => setRetryKey((value) => value + 1)} />;
  }

  if (!session || !player) {
    return <LifecycleState kind="loading" title="ログイン状態を確認しています。" />;
  }

  return (
    <>
      <section className="card">
        <h2>{player?.display_name || "Adventurer"}</h2>
        <p>GAME04へようこそ。Character、Community、Push/Fandomは仕様確定後にここへ接続します。</p>
      </section>

      <form className="profile-form" onSubmit={saveProfile}>
        <label htmlFor="display-name">表示名</label>
        <input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={32} placeholder="表示名を設定" />
        <button className="secondary-action" type="submit" disabled={saving}>
          {saving ? "保存中…" : "保存"}
        </button>
        {message && <LifecycleState kind={message.includes("できません") ? "error" : "notice"} title={message} compact />}
      </form>
    </>
  );
}
