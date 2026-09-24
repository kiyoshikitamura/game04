"use client";

import { useRef, useState } from "react";
import type { RedesignState } from "@/domain/redesign/types";
import { CHARACTER_MASTERS } from "@/domain/redesign/masters";
import { SHOP_EXCHANGE_OPTIONS, type ShopExchangeId } from "@/domain/redesign/shop";
import CanonicalDialog from "./ui/CanonicalDialog";
import OutlawButton from "./ui/OutlawButton";

type Props = { state: RedesignState; onExchange: (payload: Record<string, unknown>) => Promise<unknown> };
const labels: Record<ShopExchangeId, string> = { energy_drink: "回復薬 ×1", cash_3000: "銭 ×3,000", cash_5000: "銭 ×5,000", cash_10000: "銭 ×10,000", cash_30000: "銭 ×30,000", cash_50000: "銭 ×50,000", raid_unlock: "侵攻令 ×1", soul_generic: "同一レアリティ魂 → 汎用魂" };

export default function ShopExchangePanel({ state, onExchange }: Props) {
  const [selected, setSelected] = useState<ShopExchangeId | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [characterId, setCharacterId] = useState(CHARACTER_MASTERS[0]?.id ?? "");
  const [soulAmount, setSoulAmount] = useState(10);
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const option = selected ? SHOP_EXCHANGE_OPTIONS.find(entry => entry.id === selected) : null;
  const ownedSoul = Number(state.souls?.[characterId] ?? 0);
  const gemCost = selected === "soul_generic" ? 0 : (option?.cost ?? 0) * quantity;
  const canExchange = Boolean(option && Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= (selected === "energy_drink" ? 10 : 1) && state.diamonds >= gemCost && (selected !== "soul_generic" || (Number.isSafeInteger(soulAmount) && soulAmount >= 10 && soulAmount % 2 === 0 && ownedSoul >= soulAmount)));
  const submit = async () => {
    if (!selected || !canExchange || submitting.current) return;
    submitting.current = true;
    setBusy(true); setError("");
    try { await onExchange({ exchangeId: selected, quantity, characterId, amount: soulAmount }); setSelected(null); setResult("交換が完了しました。"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "交換できませんでした。"); }
    finally { submitting.current = false; setBusy(false); }
  };
  const card = (id: ShopExchangeId) => { const current = SHOP_EXCHANGE_OPTIONS.find(entry => entry.id === id)!; return <div key={id} className="shop-exchange-card"><div><strong>{labels[id]}</strong><p>{id === "soul_generic" ? "同一レアリティの武将魂2個につき汎用魂1個" : `${current.cost.toLocaleString("ja-JP")}輝石`}</p></div><OutlawButton variant="primary" disabled={busy} onClick={() => { setSelected(id); setQuantity(1); setError(""); }}>{id === "soul_generic" ? "交換する" : "交換"}</OutlawButton></div>; };
  return <section className="shop-section" aria-label="交換所">
    <div className="shop-section-title">交換所</div><p className="shop-card-desc">無償輝石から使用します。</p>
    <div className="shop-exchange-balance">所持：輝石 {state.diamonds.toLocaleString("ja-JP")} ／ 銭 {state.cash.toLocaleString("ja-JP")}</div>
    <div className="shop-exchange-list">{(["energy_drink", "cash_3000", "cash_5000", "cash_10000", "cash_30000", "cash_50000", "raid_unlock"] as ShopExchangeId[]).map(card)}</div>
    <div className="shop-exchange-soul">{card("soul_generic")}<p className="shop-card-desc">未所持武将の魂も交換できます。逆交換はできません。</p></div>
    {selected && <CanonicalDialog title={`${labels[selected]}を交換`} onClose={() => !submitting.current && setSelected(null)} actions={[{ label: busy ? "処理中" : "交換する", disabled: !canExchange || busy, onClick: submit }, { label: "閉じる", disabled: busy, onClick: () => !submitting.current && setSelected(null) }]}>
      {selected === "soul_generic" ? <><label>武将魂<select value={characterId} onChange={event => setCharacterId(event.target.value)}>{CHARACTER_MASTERS.map(character => <option key={character.id} value={character.id}>{character.name}（{character.rarity}）</option>)}</select></label><label>交換する数<input type="number" min={10} step={2} value={soulAmount} onChange={event => setSoulAmount(Number(event.target.value))} /></label><p>所持 {ownedSoul} → 汎用魂 {Math.floor(soulAmount / 2)}個</p></> : <>{selected === "energy_drink" && <label>交換数<input type="number" min={1} max={10} value={quantity} onChange={event => setQuantity(Math.min(10, Math.max(1, Number(event.target.value))))} /></label>}<p>受取：{selected === "energy_drink" ? `活力丸 ×${quantity}` : option?.reward}</p><p>必要：輝石 {gemCost.toLocaleString("ja-JP")} ／ 所持：輝石 {state.diamonds.toLocaleString("ja-JP")}</p></>}
      {!canExchange && <p className="shop-card-desc">{selected === "soul_generic" ? "魂の所持数または交換数を確認してください。" : "輝石が足りません。"}</p>}{error && <p role="alert" className="shop-card-desc">{error}</p>}
    </CanonicalDialog>}
    {result && <CanonicalDialog title="交換完了" onClose={() => setResult("")} actions={[{ label: "確認する", onClick: () => setResult("") }]}>{result}</CanonicalDialog>}
  </section>;
}
