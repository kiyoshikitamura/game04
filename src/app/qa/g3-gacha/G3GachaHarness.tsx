"use client";

import { useState } from "react";
import FormalGachaHub, { type FormalGachaCategory, type FormalGachaPoolItem } from "@/app/components/gacha/FormalGachaHub";
import SengokuGateOpening from "@/app/components/gacha/SengokuGateOpening";
import { GameContext } from "@/app/context/GameContext";
import "./g3-gacha.css";

const specialRates: Record<FormalGachaCategory, readonly [number, number, number]> = {
  CHARACTER: [3, 32, 65], SKILL: [5, 35, 60], EQUIPMENT: [10, 40, 50],
};
const makeSpecial = (category: FormalGachaCategory): FormalGachaPoolItem[] => ["SSR", "SR", "R"].map((rarity, index) => ({
  id: `${category}_${rarity}_QA`, name: `${category === "CHARACTER" ? "姫武将" : category === "SKILL" ? "戦技" : "武具"} ${rarity}`, rarity: rarity as FormalGachaPoolItem["rarity"], category, probability: specialRates[category][index],
}));
const normal: FormalGachaPoolItem[] = [
  { id: "CHAR_SSR_QA", name: "織田信長", rarity: "SSR", category: "CHARACTER", probability: 1 },
  { id: "SKILL_SR_QA", name: "天下布武", rarity: "SR", category: "SKILL", probability: 10 },
  { id: "EQUIP_R_QA", name: "姫鶴一文字", rarity: "R", category: "EQUIPMENT", probability: 40 },
  { id: "EQUIP_N_QA", name: "陣笠", rarity: "N", category: "EQUIPMENT", probability: 49 },
];

export default function G3GachaHarness() {
  const [gate, setGate] = useState(false);
  const [lastAction, setLastAction] = useState("未実行");
  return <GameContext.Provider value={{ playCyberSe: () => {} }}><main className="g3-gacha-harness">
    <header><h1>G3 ガチャUI確認</h1><p>保存を行わない表示・操作確認用です。</p></header>
    <FormalGachaHub
      balances={{ coin: 120000, diamond: 8000, tickets: { CHARACTER: 3, SKILL: 2, EQUIPMENT: 5 }, points: { CHARACTER: 184, SKILL: 100, EQUIPMENT: 76 } }}
      dailyFreeAvailable
      pool={{ normal, special: { CHARACTER: makeSpecial("CHARACTER"), SKILL: makeSpecial("SKILL"), EQUIPMENT: makeSpecial("EQUIPMENT") } }}
      exchangeItems={{ CHARACTER: [{ id: "CHAR_SSR_QA", name: "織田信長", category: "CHARACTER" }], SKILL: [{ id: "SKILL_SSR_QA", name: "天下布武", category: "SKILL" }], EQUIPMENT: [{ id: "EQUIP_SSR_QA", name: "姫鶴一文字", category: "EQUIPMENT" }] }}
      onDraw={async request => { setLastAction(`${request.surface} ${request.count}回 ${request.payment}`); setGate(true); }}
      onExchange={async (category, itemId) => setLastAction(`${category} ${itemId}を交換`)}
    />
    <output>直近操作：{lastAction}</output>
    <button className="g3-gacha-harness__gate" onClick={() => setGate(true)}>開門演出だけ確認</button>
    {gate && <SengokuGateOpening onComplete={() => setGate(false)} />}
  </main></GameContext.Provider>;
}
