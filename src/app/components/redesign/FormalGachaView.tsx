"use client";

import { useAudio } from '@/audio/AudioProvider';
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { RedesignResponse } from "@/utils/redesignApi";
import FormalGachaHub, {
  type FormalGachaCategory,
  type FormalGachaDrawRequest,
  type FormalGachaPoolItem,
} from "../gacha/FormalGachaHub";
import SengokuGateOpening from "../gacha/SengokuGateOpening";
import GachaModalPortal from "../gacha/GachaModalPortal";
import CanonicalDialog from "../ui/CanonicalDialog";
import { getJstDateString } from "@/utils/jst_date";
import { clearPendingIntent, pendingStorageKey, readPendingIntent, savePendingIntent, type PendingGachaIntent } from "./formalGachaPending";
import "./FormalGachaView.css";

type ApiCategory = "character" | "skill" | "equipment";
type FormalRate = { id: string; name: string; rarity: "N" | "R" | "SR" | "SSR"; category: ApiCategory; image?: string; probabilityPercent: number };
type FormalRule = { singleCost: number; tenCost: number; exchangePoints: number; ticketId: string };
type FormalCatalog = {
  masterVersion: string;
  normal: { rule: { singleCost: number; tenCost: number }; rates: FormalRate[]; day: string; freeAvailable: boolean };
  special: {
    categories: Record<ApiCategory, { rule: FormalRule; rates: FormalRate[] }>;
    points: Partial<Record<ApiCategory, number>>;
    tickets: Record<string, number>;
  };
};
type FormalResult = Omit<FormalRate, "probabilityPercent"> & { acquisition: "new" | "duplicate" | "instance"; convertedAmount: number };
type FormalResponse = RedesignResponse & { formalGacha?: FormalCatalog; formalGachaResults?: FormalResult[] };

const uiCategory = (value: ApiCategory): FormalGachaCategory => ({ character: "CHARACTER", skill: "SKILL", equipment: "EQUIPMENT" })[value] as FormalGachaCategory;
const apiCategory = (value: FormalGachaCategory): ApiCategory => ({ CHARACTER: "character", SKILL: "skill", EQUIPMENT: "equipment" })[value] as ApiCategory;
const formatOutcome = (result: FormalResult) => result.acquisition === "new" ? "初回取得"
  : result.acquisition === "instance" ? "別個体として取得"
    : result.category === "character" ? `重複 / 固有魂 +${result.convertedAmount}` : `重複 / 共通LB素材 +${result.convertedAmount}`;
function isDefinitePrecommitFailure(message: string): boolean {
  return /不足|利用済み|不正|対象.*(ありません|ではありません)|交換ポイント|ガチャ券|無料10連|抽選条件/.test(message);
}
function millisecondsUntilNextJstDay(now = Date.now()): number {
  const shifted = new Date(now + 9 * 60 * 60 * 1_000);
  const next = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate() + 1) - 9 * 60 * 60 * 1_000;
  return Math.max(50, next - now + 50);
}

export default function FormalGachaView({ data, onAction }: {
  data: RedesignResponse;
  onAction: (name: string, payload?: Record<string, unknown>, requestId?: string) => Promise<RedesignResponse>;
}) {
  const response = data as FormalResponse;
  const [catalog, setCatalog] = useState<FormalCatalog | null>(response.formalGacha ?? null);
  const actionRef = useRef(onAction);
  const requestRef = useRef<PendingGachaIntent | null>(null);
  const lifecycleRef = useRef({ mounted: true, owner: response.state.userId });
  const [loading, setLoading] = useState(!catalog);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<FormalResult[] | null>(null);
  const [opening, setOpening] = useState(false);
  const { playSe, setBgmDucked, stopSe } = useAudio();
  const soundedResults = useRef<FormalResult[] | null>(null);
  useEffect(() => { setBgmDucked(opening); return () => setBgmDucked(false); }, [opening, setBgmDucked]);
  useEffect(() => { if (opening) playSe('GACHA_START'); }, [opening, playSe]);
  useEffect(() => {
    if (opening || !results || soundedResults.current === results) return;
    soundedResults.current = results;
    playSe(results.some(result => result.rarity === 'SSR') ? 'GACHA_SSR' : 'GACHA_REVEAL');
  }, [opening, results, playSe]);
  useEffect(() => () => stopSe(), [stopSe]);
  const [recoveryPending, setRecoveryPending] = useState<PendingGachaIntent | null>(null);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [jstDay, setJstDay] = useState(() => getJstDateString());

  useEffect(() => { actionRef.current = onAction; }, [onAction]);
  useEffect(() => {
    lifecycleRef.current = { mounted: true, owner: response.state.userId };
    return () => { lifecycleRef.current.mounted = false; };
  }, [response.state.userId]);
  useEffect(() => {
    const key = pendingStorageKey(response.state.userId);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      const read = readPendingIntent(response.state.userId);
      if (read.unreadable) { setStorageBlocked(true); return; }
      setStorageBlocked(false);
      if (read.intent) {
        requestRef.current = read.intent;
        setRecoveryPending(read.intent);
      } else if (!results) {
        requestRef.current = null;
        setRecoveryPending(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [response.state.userId, results]);
  useEffect(() => {
    const updateDay = () => setJstDay(current => {
      const next = getJstDateString();
      return current === next ? current : next;
    });
    let timer = window.setTimeout(function tick() { updateDay(); timer = window.setTimeout(tick, millisecondsUntilNextJstDay()); }, millisecondsUntilNextJstDay());
    const onVisibility = () => { if (document.visibilityState === "visible") updateDay(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { window.clearTimeout(timer); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  useEffect(() => {
    let active = true;
    void actionRef.current("formal_gacha_status", {}, crypto.randomUUID()).then(async value => {
      if (!active) return;
      const nextCatalog = (value as FormalResponse).formalGacha;
      if (!nextCatalog) throw new Error("登用情報を確認できませんでした。");
      setCatalog(nextCatalog);
      setError("");
      const pendingRead = readPendingIntent(response.state.userId);
      if (pendingRead.unreadable) {
        setStorageBlocked(true);
        setError("前回の登用状態を確認できません。ブラウザの保存設定を確認してください。");
        return;
      }
      const pendingIntent = pendingRead.intent;
      if (!pendingIntent) return;
      setStorageBlocked(false);
      requestRef.current = pendingIntent;
      setRecoveryPending(pendingIntent);
      setBusy(true);
      try {
        const recovered = await actionRef.current(pendingIntent.action, pendingIntent.payload, pendingIntent.id) as FormalResponse;
        if (!active) return;
        const recoveredResults = recovered.formalGachaResults ?? [];
        if (!recoveredResults.length) throw new Error("前回の登用結果を確認できませんでした。");
        setResults(recoveredResults);
        setOpening(pendingIntent.animate);
        setRecoveryPending(null);
      } catch (reason) {
        if (!active) return;
        const message = reason instanceof Error ? reason.message : "前回の登用結果を確認できませんでした。";
        if (isDefinitePrecommitFailure(message)) {
          if (clearPendingIntent(response.state.userId, pendingIntent.id)) {
            requestRef.current = null;
            setRecoveryPending(null);
          } else setStorageBlocked(true);
        }
        setError(message);
      } finally { if (active) setBusy(false); }
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : "登用情報を確認できませんでした。");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [response.state.userId]);

  const mapped = useMemo(() => {
    if (!catalog) return null;
    const mapRows = (rows: FormalRate[]): FormalGachaPoolItem[] => rows.map(row => ({ id: row.id, name: row.name, rarity: row.rarity, category: uiCategory(row.category), probability: row.probabilityPercent }));
    const special = {
      CHARACTER: mapRows(catalog.special.categories.character.rates),
      SKILL: mapRows(catalog.special.categories.skill.rates),
      EQUIPMENT: mapRows(catalog.special.categories.equipment.rates),
    };
    return {
      pool: { normal: mapRows(catalog.normal.rates), special },
      exchangeItems: {
        CHARACTER: special.CHARACTER.filter(item => item.rarity === "SSR").map(({ id, name, category }) => ({ id, name, category })),
        SKILL: special.SKILL.filter(item => item.rarity === "SSR").map(({ id, name, category }) => ({ id, name, category })),
        EQUIPMENT: special.EQUIPMENT.filter(item => item.rarity === "SSR").map(({ id, name, category }) => ({ id, name, category })),
      },
    };
  }, [catalog]);

  const perform = async (key: string, action: string, payload: Record<string, unknown>, animate: boolean) => {
    if (busy) return;
    const ownerId = response.state.userId;
    const isCurrentOwner = () => lifecycleRef.current.mounted && lifecycleRef.current.owner === ownerId;
    const nextAction = action as PendingGachaIntent["action"];
    const execute = async () => {
      if (requestRef.current?.key !== key) {
        const storedRead = readPendingIntent(response.state.userId);
        if (storedRead.unreadable) {
          setStorageBlocked(true);
          setError("前回の登用状態を確認できません。新しい登用は開始していません。");
          return;
        }
        const stored = storedRead.intent;
        if (stored && stored.key !== key) {
          requestRef.current = stored;
          setRecoveryPending(stored);
          setError("前回の登用結果を確認してから、次の登用を行ってください。");
          return;
        }
        const intent: PendingGachaIntent = stored ?? { key, id: crypto.randomUUID(), action: nextAction, payload, animate };
        if (!stored && !savePendingIntent(response.state.userId, intent)) {
          setStorageBlocked(true);
          setError("登用を開始できませんでした。ブラウザの設定を確認して、もう一度お試しください。");
          return;
        }
        requestRef.current = intent;
      }
      setBusy(true); setError("");
      try {
        const next = await onAction(nextAction, payload, requestRef.current.id) as FormalResponse;
        if (!isCurrentOwner()) return;
        if (next.formalGacha) setCatalog(next.formalGacha);
        const nextResults = next.formalGachaResults ?? [];
        if (!nextResults.length) throw new Error("獲得結果を確認できませんでした。");
        setResults(nextResults);
        if (animate) setOpening(true);
        setRecoveryPending(null);
      } catch (reason) {
        if (!isCurrentOwner()) return;
        const message = reason instanceof Error ? reason.message : "登用を完了できませんでした。もう一度お試しください。";
        if (isDefinitePrecommitFailure(message)) {
          if (clearPendingIntent(response.state.userId, requestRef.current?.id)) {
            requestRef.current = null;
            setRecoveryPending(null);
          } else setStorageBlocked(true);
        } else if (requestRef.current) setRecoveryPending(requestRef.current);
        setError(message);
      } finally { if (isCurrentOwner()) setBusy(false); }
    };
    if (navigator.locks) await navigator.locks.request(`game04:gacha:${response.state.userId}`, execute);
    else {
      setStorageBlocked(true);
      setError("安全な登用処理を開始できませんでした。このブラウザを更新して、もう一度お試しください。");
    }
  };

  const retryRecovery = async () => {
    const ownerId = response.state.userId;
    const isCurrentOwner = () => lifecycleRef.current.mounted && lifecycleRef.current.owner === ownerId;
    const storedRead = readPendingIntent(response.state.userId);
    if (storedRead.unreadable) {
      setStorageBlocked(true);
      setError("前回の登用状態を確認できません。ブラウザの保存設定を確認してください。");
      return;
    }
    setStorageBlocked(false);
    const intent = recoveryPending ?? storedRead.intent;
    if (!intent || busy) return;
    requestRef.current = intent;
    setRecoveryPending(intent); setBusy(true); setError("");
    try {
      const next = await onAction(intent.action, intent.payload, intent.id) as FormalResponse;
      if (!isCurrentOwner()) return;
      if (next.formalGacha) setCatalog(next.formalGacha);
      const nextResults = next.formalGachaResults ?? [];
      if (!nextResults.length) throw new Error("前回の登用結果を確認できませんでした。");
      setResults(nextResults); setOpening(intent.animate); setRecoveryPending(null);
    } catch (reason) {
      if (!isCurrentOwner()) return;
      const message = reason instanceof Error ? reason.message : "前回の登用結果を確認できませんでした。";
      if (isDefinitePrecommitFailure(message)) {
        if (clearPendingIntent(response.state.userId, intent.id)) { requestRef.current = null; setRecoveryPending(null); }
        else setStorageBlocked(true);
      }
      setError(message);
    } finally { if (isCurrentOwner()) setBusy(false); }
  };

  const closeResults = () => {
    if (!clearPendingIntent(response.state.userId, requestRef.current?.id)) {
      setStorageBlocked(true);
      setError("結果の確認状態を保存できませんでした。ブラウザの保存設定を確認してください。");
      return;
    }
    requestRef.current = null;
    setRecoveryPending(null);
    setResults(null);
  };

  const retryCatalogAndRecovery = async () => {
    if (loading || busy) return;
    const ownerId = response.state.userId;
    setError(""); setLoading(true);
    try {
      const value = await actionRef.current("formal_gacha_status", {}, crypto.randomUUID()) as FormalResponse;
      if (!lifecycleRef.current.mounted || lifecycleRef.current.owner !== ownerId) return;
      if (!value.formalGacha) throw new Error("登用情報を確認できませんでした。");
      setCatalog(value.formalGacha);
      await retryRecovery();
    } catch (reason) {
      if (!lifecycleRef.current.mounted || lifecycleRef.current.owner !== ownerId) return;
      setError(reason instanceof Error ? reason.message : "再取得できませんでした。");
    } finally { if (lifecycleRef.current.mounted && lifecycleRef.current.owner === ownerId) setLoading(false); }
  };

  if (!catalog || !mapped) return <section className="rd-panel formal-gacha-view__loading" aria-busy={loading}>
    <p role={error ? "alert" : "status"}>{error || "登用情報を確認中…"}</p>
    {error && <button className="rd-button" disabled={loading || busy} onClick={() => void retryCatalogAndRecovery()}>再取得</button>}
  </section>;

  const ticket = (category: ApiCategory) => Number(catalog.special.tickets[catalog.special.categories[category].rule.ticketId] ?? 0);
  return <section className="formal-gacha-view">
    {error && <p className="rd-panel" role="alert">{error}</p>}
    {(recoveryPending || storageBlocked) && <section className="rd-panel formal-gacha-view__recovery"><p>前回の登用結果を確認しています。新しい登用は、確認後に行えます。</p><button className="rd-button" disabled={busy} onClick={() => void retryRecovery()}>{busy ? "確認中…" : "前回の結果を確認"}</button></section>}
    <div inert={opening || !!results}><FormalGachaHub
      balances={{
        coin: response.state.cash,
        diamond: response.state.diamonds,
        tickets: { CHARACTER: ticket("character"), SKILL: ticket("skill"), EQUIPMENT: ticket("equipment") },
        points: {
          CHARACTER: Number(response.state.specialGachaPoints?.character ?? catalog.special.points.character ?? 0),
          SKILL: Number(response.state.specialGachaPoints?.skill ?? catalog.special.points.skill ?? 0),
          EQUIPMENT: Number(response.state.specialGachaPoints?.equipment ?? catalog.special.points.equipment ?? 0),
        },
      }}
      dailyFreeAvailable={response.state.dailyNormalGachaDate !== jstDay}
      pending={busy || !!recoveryPending || storageBlocked || !!results || opening}
      pool={mapped.pool}
      exchangeItems={mapped.exchangeItems}
      onDraw={async (request: FormalGachaDrawRequest) => {
        const payload = request.surface === "NORMAL"
          ? { mode: "normal", count: request.count, payment: request.payment === "COIN" ? "CASH" : request.payment }
          : { mode: "special", category: apiCategory(request.category!), count: request.count, payment: request.payment === "DIAMOND" ? "DIAMONDS" : request.payment };
        const key = `draw:${JSON.stringify(payload)}`;
        await perform(key, "formal_gacha", payload, true);
      }}
      onExchange={async (category, itemId) => {
        const payload = { category: apiCategory(category), itemId };
        await perform(`exchange:${JSON.stringify(payload)}`, "formal_gacha_exchange", payload, false);
      }}
    /></div>
    {opening && <SengokuGateOpening rarity={results?.some(result => result.rarity === "SSR") ? "SSR" : results?.some(result => result.rarity === "SR") ? "SR" : "R"} onComplete={() => setOpening(false)} />}
    {results && !opening && <GachaModalPortal onEscape={closeResults}><CanonicalDialog title="登用結果" onClose={closeResults} actions={[{ label: "登用へ戻る", semantic: "primary", onClick: closeResults }]}>
      <div className={`formal-gacha-results ${results.length >= 10 ? "is-ten" : ""}`}>{results.map((result, index) => <article key={`${result.category}:${result.id}:${index}`} data-acquisition={result.acquisition} className={`rarity-${result.rarity.toLowerCase()}`}>
        <div className="formal-gacha-results__art">{result.image ? <Image src={result.image} alt="" width={42} height={42} unoptimized /> : <span>{result.category === "character" ? "姫武将" : result.category === "skill" ? "戦技" : "武具"}</span>}</div>
        <strong>{result.name}</strong><small>{result.rarity}</small><em>{formatOutcome(result)}</em>
      </article>)}</div>
    </CanonicalDialog></GachaModalPortal>}
  </section>;
}
