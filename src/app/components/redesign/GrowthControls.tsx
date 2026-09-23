'use client';
import { useState } from 'react';
import type { ExpSize, RedesignState } from '@/domain/redesign/types';
import { CHARACTER_MASTERS, getSkillSlots } from '@/domain/redesign/masters';
import { quoteLevelGrowth } from '@/domain/redesign/growth';
import { AWAKENING_SOULS, EXP_SIZES, EXP_VALUES, SOUL_UNLOCK, emptyGrowthInventory, type GrowthKind } from '@/domain/redesign/growthMaster';

type Run = (action: string, payload: Record<string, unknown>) => Promise<boolean | undefined>;
const labels: Record<ExpSize, string> = { small: '小', medium: '中', large: '大', xlarge: '特大' };

export function LevelGrowthControls({ state, kind, id, run, busy }: { state: RedesignState; kind: GrowthKind; id: string; run: Run; busy: boolean }) {
  const [items, setItems] = useState<Partial<Record<ExpSize, number>>>({});
  const inventory = state.growthInventory ?? emptyGrowthInventory();
  let quote: ReturnType<typeof quoteLevelGrowth> | undefined;
  let error = '';
  try { quote = quoteLevelGrowth(state, kind, id, items); } catch (e) { error = e instanceof Error ? e.message : '投入数を確認してください。'; }
  const owned = kind === 'character' ? state.characters.find(c => c.id === id) : state.equipment.find(e => e.instanceId === id);
  return <fieldset disabled={busy}><legend>経験値素材を選択</legend>
    <p>現在Lv.{owned?.level}・累計EXP {owned?.exp ?? 0}・繰越EXP {inventory.carryExp[kind].toLocaleString()}</p>
    <div className="g4g-material-grid">{EXP_SIZES.map(size => <label className="g4g-material-choice" key={size}>EXP{labels[size]}（{EXP_VALUES[size].toLocaleString()}） 所持{inventory.expItems[kind][size]}<input aria-label={`${kind === 'character' ? '武将' : '装備'}EXP${labels[size]}投入数`} type="number" min={0} max={inventory.expItems[kind][size]} step={1} value={items[size] ?? 0} onChange={e => setItems({ ...items, [size]: Math.max(0, Math.min(inventory.expItems[kind][size], Math.trunc(Number(e.target.value) || 0))) })}/></label>)}</div>
    <button type="button" onClick={() => setItems({ ...inventory.expItems[kind] })}>所持数を一括選択</button><button type="button" onClick={() => setItems({})}>選択を解除</button>
    {quote ? <><p>Lv.{quote.levelBefore} → {quote.levelAfter} / 解放上限{quote.levelCap}</p><p>実消費：{EXP_SIZES.map(s => `${labels[s]}${quote!.consumedItems[s]}個`).join('・')}</p><p>必要銭 {quote.cash.toLocaleString()} / 所持 {state.cash.toLocaleString()}</p><p>繰越EXP {quote.carryBefore.toLocaleString()} → {quote.carryAfter.toLocaleString()}</p><button disabled={busy || state.cash < quote.cash} onClick={() => void run(`${kind}_level`, { [kind === 'character' ? 'characterId' : 'instanceId']: id, items })}>この内容で育成する</button>{state.cash < quote.cash && <p>銭が不足しています。投入数を変更してください。</p>}</> : <p role="status">{error}</p>}
  </fieldset>;
}

export function SoulControls({ state, id, run, busy, mode='awaken' }: { state: RedesignState; id: string; run: Run; busy: boolean; mode?: 'awaken'|'exchange' }) {
  const master = CHARACTER_MASTERS.find(c => c.id === id)!;
  const owned = state.characters.find(c => c.id === id);
  const inventory = state.growthInventory ?? emptyGrowthInventory();
  const souls = state.souls[id] ?? 0, generic = inventory.genericSouls[master.rarity];
  const cost = owned && owned.awakening < 5 ? AWAKENING_SOULS[master.rarity][owned.awakening] : 0;
  const [specificOverride, setSpecific] = useState<number | null>(null);
  const [amount, setAmount] = useState(0);
  const [confirm, setConfirm] = useState<'exchange' | 'select' | null>(null);
  const specific = specificOverride ?? Math.min(souls, cost), common = cost - specific;
  return <fieldset disabled={busy}><legend>魂・覚醒</legend><p>固有魂 {souls}・{master.rarity}汎用魂 {generic}</p>
    {mode==='awaken'&&(!owned ? <><p>初回解放：固有魂 {SOUL_UNLOCK[master.rarity]}個・銭不要。汎用魂は使えません。</p><button disabled={souls < SOUL_UNLOCK[master.rarity]} onClick={() => void run('character_unlock', { characterId: id })}>固有魂で武将を迎える</button></> : cost > 0 ? <><p>覚醒+{owned.awakening} → +{owned.awakening + 1}・必要魂{cost}・必要銭{(cost * 2000).toLocaleString()}</p><label>固有魂を使う数<input aria-label="覚醒で使う固有魂" type="number" min={0} max={Math.min(souls, cost)} step={1} value={specific} onChange={e => setSpecific(Number(e.target.value))}/></label><p>汎用魂 {common}個を併用</p><p>Lv上限 {50 + owned.awakening * 10} → {60 + owned.awakening * 10}・スキル枠 {getSkillSlots(owned.awakening)} → {getSkillSlots(owned.awakening + 1)}{master.rarity !== 'N' && `・パッシブLv ${owned.awakening * 2} → ${(owned.awakening + 1) * 2}`}</p><button disabled={!Number.isSafeInteger(specific) || specific < 0 || specific > souls || common < 0 || common > generic || state.cash < cost * 2000} onClick={async () => { if (await run('character_awaken', { characterId: id, specificSouls: specific, genericSouls: common })) setSpecific(null); }}>この内訳で覚醒する</button></> : <p>最大覚醒です。</p>)}
    {mode==='exchange'&&<><h4>固有魂を汎用魂へ交換</h4><label>固有魂の交換数（2個単位）<input aria-label="固有魂の交換数" type="number" min={0} max={souls - souls % 2} step={2} value={amount} onChange={e => { setAmount(Number(e.target.value)); setConfirm(null); }}/></label>
    <p>固有魂 {souls} → {souls - amount}・{master.rarity}汎用魂 {generic} → {generic + amount / 2}・銭不要</p><button disabled={!Number.isSafeInteger(amount) || amount <= 0 || amount % 2 !== 0 || amount > souls} onClick={() => setConfirm('exchange')}>交換内容を確認</button>
    <h4>{master.rarity}魂選択アイテム：{inventory.soulSelectors[master.rarity]}個</h4><p>1個 → {master.name}の固有魂10個</p><button disabled={!owned || owned.awakening >= 5 || inventory.soulSelectors[master.rarity] < 1} onClick={() => setConfirm('select')}>この武将の魂を選ぶ</button>
    </>}{confirm && <div role="group" aria-label="魂操作の確認"><p>{confirm === 'exchange' ? `固有魂${amount}個を汎用魂${amount / 2}個へ交換します。元には戻せません。` : `選択アイテム1個を${master.name}の固有魂10個へ変換します。`}</p><button onClick={async () => { if (await run(confirm === 'exchange' ? 'soul_exchange' : 'soul_select', { characterId: id, amount: confirm === 'exchange' ? amount : 1 })) { setConfirm(null); setAmount(0); } }}>確定する</button><button onClick={() => setConfirm(null)}>取消</button></div>}
  </fieldset>;
}

export function GrowthInventoryView({ state }: { state: RedesignState }) {
  const inventory = state.growthInventory ?? emptyGrowthInventory();
  return <details><summary>育成アイテムの所持数</summary>{(['character', 'equipment'] as const).map(kind => <div key={kind}><h4>{kind === 'character' ? '武将EXP' : '装備EXP'}</h4>{EXP_SIZES.map(size => <p key={size}>{labels[size]}（{EXP_VALUES[size].toLocaleString()} EXP）×{inventory.expItems[kind][size]}</p>)}<p>繰越EXP：{inventory.carryExp[kind]}</p></div>)}<p>スキルLB素材：{state.materials.skill}・装備LB素材：{state.materials.equipmentLb}</p>{(['N', 'R', 'SR', 'SSR'] as const).map(r => <p key={r}>{r}汎用魂：{inventory.genericSouls[r]}・{r}魂選択：{inventory.soulSelectors[r]}</p>)}</details>;
}
