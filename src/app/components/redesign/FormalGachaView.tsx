"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { RedesignResponse } from "@/utils/redesignApi";
import FormalGachaHub, {
  type FormalGachaCategory,
  type FormalGachaDrawRequest,
  type FormalGachaPoolItem,
} from "../gacha/FormalGachaHub";
import SengokuGateOpening from "../gacha/SengokuGateOpening";
import CanonicalDialog from "../ui/CanonicalDialog";
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

export default function FormalGachaView({ data, onAction }: {
  data: RedesignResponse;
  onAction: (name: string, payload?: Record<string, unknown>, requestId?: string) => Promise<RedesignResponse>;
}) {
  const response = data as FormalResponse;
  const [catalog, setCatalog] = useState<FormalCatalog | null>(response.formalGacha ?? null);
  const actionRef = useRef(onAction);
  const requestRef = useRef<{ key: string; id: string } | null>(null);
  const [loading, setLoading] = useState(!catalog);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<FormalResult[] | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => { actionRef.current = onAction; }, [onAction]);

  useEffect(() => {
    let active = true;
    void actionRef.current("formal_gacha_status", {}, crypto.randomUUID()).then(value => {
      if (!active) return;
      const nextCatalog = (value as FormalResponse).formalGacha;
      if (!nextCatalog) throw new Error("登用情報を確認できませんでした。");
      setCatalog(nextCatalog);
      setError("");
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : "登用情報を確認できませんでした。");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

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
    if (requestRef.current?.key !== key) requestRef.current = { key, id: crypto.randomUUID() };
    setBusy(true); setError("");
    try {
      const next = await onAction(action, payload, requestRef.current.id) as FormalResponse;
      const nextResults = next.formalGachaResults ?? [];
      if (!nextResults.length) throw new Error("獲得結果を確認できませんでした。");
      requestRef.current = null;
      setResults(nextResults);
      if (animate) setOpening(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "登用を完了できませんでした。もう一度お試しください。");
    } finally { setBusy(false); }
  };

  if (!catalog || !mapped) return <section className="rd-panel formal-gacha-view__loading" aria-busy={loading}>
    <p role={error ? "alert" : "status"}>{error || "登用情報を確認中…"}</p>
    {error && <button className="rd-button" onClick={() => { setError(""); setLoading(true); void actionRef.current("formal_gacha_status", {}, crypto.randomUUID()).then(value => { const nextCatalog = (value as FormalResponse).formalGacha; if (!nextCatalog) throw new Error("登用情報を確認できませんでした。"); setCatalog(nextCatalog); }).catch(reason => setError(reason instanceof Error ? reason.message : "再取得できませんでした。")).finally(() => setLoading(false)); }}>再取得</button>}
  </section>;

  const ticket = (category: ApiCategory) => Number(response.state.questTicketGrants?.[catalog.special.categories[category].rule.ticketId] ?? catalog.special.tickets[catalog.special.categories[category].rule.ticketId] ?? 0);
  return <section className="formal-gacha-view">
    {error && <p className="rd-panel" role="alert">{error}</p>}
    <FormalGachaHub
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
      dailyFreeAvailable={response.state.dailyNormalGachaDate !== catalog.normal.day}
      pending={busy}
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
    />
    {opening && <SengokuGateOpening rarity={results?.some(result => result.rarity === "SSR") ? "SSR" : results?.some(result => result.rarity === "SR") ? "SR" : "R"} onComplete={() => setOpening(false)} />}
    {results && !opening && <CanonicalDialog title="登用結果" onClose={() => setResults(null)} actions={[{ label: "登用へ戻る", semantic: "primary", onClick: () => setResults(null) }]}>
      <div className={`formal-gacha-results ${results.length >= 10 ? "is-ten" : ""}`}>{results.map((result, index) => <article key={`${result.category}:${result.id}:${index}`} data-acquisition={result.acquisition} className={`rarity-${result.rarity.toLowerCase()}`}>
        <div className="formal-gacha-results__art">{result.image ? <Image src={result.image} alt="" width={42} height={42} unoptimized /> : <span>{result.category === "character" ? "姫武将" : result.category === "skill" ? "戦技" : "武具"}</span>}</div>
        <strong>{result.name}</strong><small>{result.rarity}</small><em>{formatOutcome(result)}</em>
      </article>)}</div>
    </CanonicalDialog>}
  </section>;
}
