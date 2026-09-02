"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Player = {
  id: string;
  display_name: string | null;
};

export function HomePanel() {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    const load = async (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);

      if (!nextSession) {
        setPlayer(null);
        setStatus("ready");
        return;
      }

      const { data, error } = await supabase
        .from("players")
        .select("id, display_name")
        .eq("id", nextSession.user.id)
        .maybeSingle();

      if (!active) return;
      if (error) {
        setStatus("error");
        setMessage("プレイヤー情報を取得できませんでした。");
        return;
      }

      const nextPlayer = data as Player | null;
      setPlayer(nextPlayer);
      setDisplayName(nextPlayer?.display_name ?? "");
      setStatus("ready");
    };

    void supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void load(nextSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !session || !player) return;

    setStatus("saving");
    setMessage("");
    const normalizedName = displayName.trim() || null;
    const { error } = await supabase.rpc("update_current_player_profile", {
      p_display_name: normalizedName,
    });

    if (error) {
      setStatus("error");
      setMessage("表示名を保存できませんでした。");
      return;
    }

    setPlayer({ ...player, display_name: normalizedName });
    setDisplayName(normalizedName ?? "");
    setStatus("ready");
    setMessage("表示名を保存しました。");
  }

  if (!supabase) {
    return <p className="notice">ゲーム接続を準備しています。</p>;
  }

  if (status === "loading") {
    return <p className="notice">Homeを読み込んでいます。</p>;
  }

  if (!session) {
    return <p className="notice">タイトル画面からログインすると、GAME04のHomeを利用できます。</p>;
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
        <button className="secondary-action" type="submit" disabled={status === "saving"}>
          {status === "saving" ? "保存中…" : "保存"}
        </button>
        {message && <p className="notice" aria-live="polite">{message}</p>}
      </form>
    </>
  );
}
