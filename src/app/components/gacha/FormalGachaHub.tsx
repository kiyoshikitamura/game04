"use client";

import { useMemo, useState } from "react";
import CanonicalDialog from "../ui/CanonicalDialog";
import GachaModalPortal from "./GachaModalPortal";
import "./FormalGachaHub.css";

export type FormalGachaCategory = "CHARACTER" | "SKILL" | "EQUIPMENT";
export type FormalGachaPayment = "FREE" | "COIN" | "DIAMOND" | "TICKET";
export type FormalGachaPoolItem = {
  id: string;
  name: string;
  rarity: "N" | "R" | "SR" | "SSR";
  category: FormalGachaCategory;
  probability: number;
};
export type FormalGachaBalances = {
  coin: number;
  diamond: number;
  tickets: Record<FormalGachaCategory, number>;
  points: Record<FormalGachaCategory, number>;
};
export type FormalGachaExchangeItem = Pick<FormalGachaPoolItem, "id" | "name" | "category">;
export type FormalGachaDrawRequest = {
  surface: "NORMAL" | "SPECIAL";
  category?: FormalGachaCategory;
  count: 1 | 10;
  payment: FormalGachaPayment;
};

const CATEGORY: Record<FormalGachaCategory, { label: string; cost: number; pity: number; rates: string }> = {
  CHARACTER: { label: "姫武将", cost: 300, pity: 200, rates: "SSR 3% / SR 32% / R 65%" },
  SKILL: { label: "戦技", cost: 300, pity: 100, rates: "SSR 5% / SR 35% / R 60%" },
  EQUIPMENT: { label: "武具", cost: 200, pity: 100, rates: "SSR 10% / SR 40% / R 50%" },
};

export default function FormalGachaHub({
  balances,
  dailyFreeAvailable,
  pending = false,
  pool,
  exchangeItems,
  onDraw,
  onExchange,
}: {
  balances: FormalGachaBalances;
  dailyFreeAvailable: boolean;
  pending?: boolean;
  pool: { normal: FormalGachaPoolItem[]; special: Record<FormalGachaCategory, FormalGachaPoolItem[]> };
  exchangeItems: Record<FormalGachaCategory, FormalGachaExchangeItem[]>;
  onDraw: (request: FormalGachaDrawRequest) => Promise<unknown>;
  onExchange: (category: FormalGachaCategory, itemId: string) => Promise<unknown>;
}) {
  const [surface, setSurface] = useState<"NORMAL" | "SPECIAL">("NORMAL");
  const [category, setCategory] = useState<FormalGachaCategory>("CHARACTER");
  const [confirm, setConfirm] = useState<FormalGachaDrawRequest | null>(null);
  const [ratesOpen, setRatesOpen] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [exchangeTarget, setExchangeTarget] = useState<string | null>(null);
  const meta = CATEGORY[category];
  const rates = surface === "NORMAL" ? pool.normal : pool.special[category];
  const groupedRates = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of rates) map.set(item.rarity, (map.get(item.rarity) || 0) + Number(item.probability || 0));
    return ["SSR", "SR", "R", "N"].flatMap(rarity => map.has(rarity) ? [[rarity, map.get(rarity)!] as const] : []);
  }, [rates]);
  const paymentText = (request: FormalGachaDrawRequest) => {
    if (request.payment === "FREE") return "消費なし";
    if (request.payment === "TICKET") return `特選${meta.label}券 ${request.count}枚`;
    if (request.payment === "COIN") return `${(1000 * request.count).toLocaleString("ja-JP")}銭`;
    return `${(meta.cost * request.count).toLocaleString("ja-JP")}輝石`;
  };
  const canPay = (request: FormalGachaDrawRequest) => {
    if (request.payment === "FREE") return dailyFreeAvailable && request.count === 10;
    if (request.payment === "TICKET") return balances.tickets[category] >= request.count;
    if (request.payment === "COIN") return balances.coin >= 1000 * request.count;
    return balances.diamond >= meta.cost * request.count;
  };
  const choose = (request: FormalGachaDrawRequest) => setConfirm(request);

  return (
    <section className="formal-gacha" aria-label="登用">
      <div className="formal-gacha__surface" role="tablist" aria-label="登用種別">
        <button role="tab" aria-selected={surface === "NORMAL"} onClick={() => setSurface("NORMAL")}>通常登用</button>
        <button role="tab" aria-selected={surface === "SPECIAL"} onClick={() => setSurface("SPECIAL")}>特選登用</button>
      </div>

      {surface === "NORMAL" ? (
        <article className="formal-gacha__card is-normal">
          <header><div><small>三種混合</small><h2>通常登用</h2></div><button className="formal-gacha__link" onClick={() => setRatesOpen(true)}>提供割合・排出一覧</button></header>
          <p>姫武将・戦技・武具が排出されます</p>
          <div className="formal-gacha__rate-summary"><span>SSR 1%</span><span>SR 10%</span><span>R 40%</span><span>N 49%</span></div>
          <div className="formal-gacha__balance"><span>所持</span><strong>{balances.coin.toLocaleString("ja-JP")}銭</strong></div>
          {dailyFreeAvailable ? <button className="formal-gacha__primary" disabled={pending} onClick={() => choose({ surface: "NORMAL", count: 10, payment: "FREE" })}><b>本日10連無料</b><small>毎日0時更新</small></button> : <p className="formal-gacha__used">本日の無料10連は利用済みです</p>}
          <div className="formal-gacha__actions">
            <button disabled={pending || balances.coin < 1000} onClick={() => choose({ surface: "NORMAL", count: 1, payment: "COIN" })}><b>1回</b><small>1,000銭</small></button>
            <button disabled={pending || balances.coin < 10000} onClick={() => choose({ surface: "NORMAL", count: 10, payment: "COIN" })}><b>10連</b><small>10,000銭</small></button>
          </div>
        </article>
      ) : (
        <>
          <nav className="formal-gacha__categories" aria-label="特選カテゴリ">
            {(Object.keys(CATEGORY) as FormalGachaCategory[]).map(key => <button key={key} aria-pressed={category === key} onClick={() => setCategory(key)}>{CATEGORY[key].label}</button>)}
          </nav>
          <article className={`formal-gacha__card is-special is-${category.toLowerCase()}`}>
            <header><div><small>N排出なし</small><h2>{meta.label} 特選登用</h2></div><button className="formal-gacha__link" onClick={() => setRatesOpen(true)}>提供割合・排出一覧</button></header>
            <p>{meta.rates}</p>
            <div className="formal-gacha__ledger">
              <span>輝石 <b>{balances.diamond.toLocaleString("ja-JP")}</b></span>
              <span>特選券 <b>{balances.tickets[category].toLocaleString("ja-JP")}</b></span>
            </div>
            <button className="formal-gacha__points" onClick={() => { setExchangeTarget(null); setExchangeOpen(true); }}>
              <span>SSR選択交換</span><strong>{balances.points[category]} / {meta.pity}Pt</strong>
            </button>
            <div className="formal-gacha__actions">
              <button disabled={pending || balances.diamond < meta.cost} onClick={() => choose({ surface: "SPECIAL", category, count: 1, payment: "DIAMOND" })}><b>1回</b><small>{meta.cost}輝石</small></button>
              <button disabled={pending || balances.diamond < meta.cost * 10} onClick={() => choose({ surface: "SPECIAL", category, count: 10, payment: "DIAMOND" })}><b>10連</b><small>{(meta.cost * 10).toLocaleString("ja-JP")}輝石</small></button>
              <button disabled={pending || balances.tickets[category] < 1} onClick={() => choose({ surface: "SPECIAL", category, count: 1, payment: "TICKET" })}><b>特選券で1回</b><small>所持 {balances.tickets[category]}枚</small></button>
            </div>
          </article>
        </>
      )}

      {confirm && <GachaModalPortal onEscape={pending ? undefined : () => setConfirm(null)}><CanonicalDialog title="登用確認" onClose={pending ? undefined : () => setConfirm(null)} actions={[
        { label: "戻る", disabled: pending, onClick: () => setConfirm(null) },
        { label: `${confirm.count === 10 ? "10連" : "1回"}引く`, semantic: "primary", disabled: pending || !canPay(confirm), onClick: async () => { const request = confirm; setConfirm(null); await onDraw(request); } },
      ]}><p className="formal-gacha__confirm"><b>{paymentText(confirm)}</b>を消費します。<br />別の支払方法へ自動で切り替わることはありません。</p></CanonicalDialog></GachaModalPortal>}

      {ratesOpen && <GachaModalPortal onEscape={() => setRatesOpen(false)}><CanonicalDialog title={surface === "NORMAL" ? "通常登用 提供割合" : `${meta.label}特選 提供割合`} onClose={() => setRatesOpen(false)} actions={[{ label: "閉じる", semantic: "primary", onClick: () => setRatesOpen(false) }]}>
        <div className="formal-gacha__rates custom-scrollbar" tabIndex={0} role="region" aria-label="提供割合と排出一覧">
          <div className="formal-gacha__rate-totals">{groupedRates.map(([rarity, value]) => <span key={rarity}><b>{rarity}</b>{value.toFixed(2)}%</span>)}</div>
          {rates.map(item => <div className="formal-gacha__rate-row" key={`${item.category}:${item.id}`}><span><b>{item.rarity}</b>{item.name}</span><strong>{item.probability.toFixed(4)}%</strong></div>)}
        </div>
      </CanonicalDialog></GachaModalPortal>}

      {exchangeOpen && <GachaModalPortal onEscape={pending ? undefined : () => setExchangeOpen(false)}><CanonicalDialog title={`${meta.label} SSR選択交換`} onClose={pending ? undefined : () => setExchangeOpen(false)} actions={exchangeTarget ? [
        { label: `${meta.pity}Ptで交換`, semantic: "primary", disabled: pending || balances.points[category] < meta.pity, onClick: async () => { const target = exchangeTarget; setExchangeOpen(false); setExchangeTarget(null); await onExchange(category, target); } },
      ] : []}>
        <p>所持 {balances.points[category]}Pt / 必要 {meta.pity}Pt</p>
        <div className="formal-gacha__exchange custom-scrollbar">{exchangeItems[category].map(item => <button key={item.id} aria-pressed={exchangeTarget === item.id} onClick={() => setExchangeTarget(item.id)}>{item.name}</button>)}</div>
      </CanonicalDialog></GachaModalPortal>}
    </section>
  );
}
