'use client';
import { useState, type ReactNode } from 'react';
import { growthExpImage, growthSoulImage } from '@/domain/redesign/growthAssetPresentation';
import type { ExpSize, RedesignState } from '@/domain/redesign/types';
import { CHARACTER_MASTERS, EQUIPMENT_MASTERS, getSkillSlots } from '@/domain/redesign/masters';
import { getCharacterLevelCap, getEquipmentLevelCap, quoteLevelGrowth } from '@/domain/redesign/growth';
import { AWAKENING_SOULS, EXP_SIZES, EXP_VALUES, SOUL_UNLOCK, emptyGrowthInventory, type GrowthKind } from '@/domain/redesign/growthMaster';

type Run = (action: string, payload: Record<string, unknown>) => Promise<boolean | undefined>;
type Presentation = { portrait?: ReactNode; onCancel?: () => void };
const labels: Record<ExpSize, string> = { small: '小', medium: '中', large: '大', xlarge: '特大' };
const elements: Record<string, string> = { fire: '火', water: '水', earth: '土', wind: '風', light: '光', dark: '闇' };

function Stepper({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (n: number) => void }) {
  const update = (n: number) => onChange(Math.max(0, Math.min(max, Math.trunc(n || 0))));
  return <div className="g4g-stepper"><button type="button" aria-label={`${label}を減らす`} disabled={value <= 0} onClick={() => update(value - 1)}>−</button><input aria-label={label} type="number" min={0} max={max} step={1} value={value} onChange={e => update(Number(e.target.value))}/><button type="button" aria-label={`${label}を増やす`} disabled={value >= max} onClick={() => update(value + 1)}>＋</button></div>;
}

export function LevelGrowthControls({ state, kind, id, run, busy, portrait, onCancel }: { state: RedesignState; kind: GrowthKind; id: string; run: Run; busy: boolean } & Presentation) {
  const inventory = state.growthInventory ?? emptyGrowthInventory();
  const [items, setItems] = useState<Partial<Record<ExpSize, number>>>(() => ({ small: inventory.expItems[kind].small > 0 ? 1 : 0 }));
  let quote: ReturnType<typeof quoteLevelGrowth> | undefined;
  let error = '';
  try { quote = quoteLevelGrowth(state, kind, id, items); } catch (e) { error = e instanceof Error ? e.message : '投入数を確認してください。'; }
  const character = kind === 'character' ? state.characters.find(c => c.id === id) : undefined;
  const equipment = kind === 'equipment' ? state.equipment.find(e => e.instanceId === id) : undefined;
  const owned = character ?? equipment;
  const master = character ? CHARACTER_MASTERS.find(c => c.id === id) : EQUIPMENT_MASTERS.find(e => e.id === equipment?.masterId);
  const cap = character ? getCharacterLevelCap(character.awakening) : getEquipmentLevelCap(equipment?.lb ?? 0);
  const cash = quote?.cash ?? 0;
  return <fieldset className="g4g-growth-controls" disabled={busy} aria-label="Lv育成の内容">
    <div className="g4g-growth-hero"><div className="g4g-growth-portrait">{portrait ?? (master && 'image' in master ? <img src={master.image} alt={master.name}/> : null)}</div><div className="g4g-growth-summary"><h3>{master?.name}</h3><p>{master?.rarity}{master && 'element' in master ? `・${elements[master.element]}` : ''}</p><div className="g4g-growth-transition">Lv.{owned?.level} <span>→</span> <strong>Lv.{quote?.levelAfter ?? owned?.level}</strong></div><p>上限 {cap} / 最大 100</p></div></div>
    <div className="g4g-growth-section-head"><strong>経験値素材を選択</strong><button type="button" onClick={() => setItems({ ...inventory.expItems[kind] })}>一括選択</button><button type="button" onClick={() => setItems({})}>解除</button></div>
    <div className="g4g-material-grid">{EXP_SIZES.map(size => <div className="g4g-material-choice" key={size}><img src={growthExpImage(kind, size)} alt=""/><div className="g4g-material-info"><strong>{labels[size]}</strong><small>EXP {EXP_VALUES[size].toLocaleString()}</small><small>所持 {inventory.expItems[kind][size]}</small></div><Stepper label={`${kind === 'character' ? '武将' : '装備'}EXP${labels[size]}投入数`} value={items[size] ?? 0} max={inventory.expItems[kind][size]} onChange={n => setItems({ ...items, [size]: n })}/></div>)}</div>
    <dl className="g4g-growth-ledger"><div><dt>累計EXP</dt><dd>{(owned?.exp ?? 0).toLocaleString()} → {(quote?.expAfter ?? owned?.exp ?? 0).toLocaleString()}</dd></div><div><dt>繰越EXP</dt><dd>{inventory.carryExp[kind].toLocaleString()} → {(quote?.carryAfter ?? inventory.carryExp[kind]).toLocaleString()}</dd></div><div><dt>消費銭</dt><dd>{cash.toLocaleString()}</dd></div><div><dt>所持銭</dt><dd>{state.cash.toLocaleString()} → <strong>{(state.cash - cash).toLocaleString()}</strong></dd></div></dl>
    {quote && <small className="g4g-growth-note">実消費：{EXP_SIZES.map(s => `${labels[s]}${quote!.consumedItems[s]}個`).join('・')}</small>}
    {error && <p role="status">{error}</p>}{quote && state.cash < cash && <p role="status">銭が不足しています。投入数を変更してください。</p>}
    <div className="g4g-growth-footer">{onCancel && <button type="button" onClick={onCancel}>キャンセル</button>}<button type="button" className="g4g-primary" disabled={!quote || state.cash < cash} onClick={() => void run(`${kind}_level`, { [kind === 'character' ? 'characterId' : 'instanceId']: id, items })}>育成する</button></div>
  </fieldset>;
}

export function SoulControls({ state, id, run, busy, mode = 'awaken', portrait, onCancel }: { state: RedesignState; id: string; run: Run; busy: boolean; mode?: 'awaken' | 'exchange' } & Presentation) {
  const master = CHARACTER_MASTERS.find(c => c.id === id)!;
  const owned = state.characters.find(c => c.id === id);
  const inventory = state.growthInventory ?? emptyGrowthInventory();
  const souls = state.souls[id] ?? 0, generic = inventory.genericSouls[master.rarity];
  const cost = owned && owned.awakening < 5 ? AWAKENING_SOULS[master.rarity][owned.awakening] : 0;
  const unlockCost = SOUL_UNLOCK[master.rarity];
  const [specificOverride, setSpecific] = useState<number | null>(null);
  const [amount, setAmount] = useState(10);
  const [confirm, setConfirm] = useState<'exchange' | 'select' | null>(null);
  const specific = specificOverride ?? Math.min(souls, cost), common = cost - specific;
  const awakeningDisabled = !Number.isSafeInteger(specific) || specific < 0 || specific > souls || common < 0 || common > generic || state.cash < cost * 2000;
  return <fieldset className="g4g-growth-controls" disabled={busy} aria-label="魂・覚醒">
    <div className="g4g-growth-hero"><div className="g4g-growth-portrait">{portrait}</div><div className="g4g-growth-summary"><h3>{master.name}</h3><p>{master.rarity}・{elements[master.element]}</p>{mode === 'awaken' && owned && cost > 0 && <><div className="g4g-growth-transition">覚醒 <strong>+{owned.awakening} → +{owned.awakening + 1}</strong></div><table className="g4g-growth-comparison"><tbody><tr><th>Lv上限</th><td>{getCharacterLevelCap(owned.awakening)}</td><td>→</td><td>{getCharacterLevelCap(owned.awakening + 1)}</td></tr><tr><th>スキル枠</th><td>{getSkillSlots(owned.awakening)}</td><td>→</td><td>{getSkillSlots(owned.awakening + 1)}</td></tr>{master.rarity !== 'N' && <tr><th>パッシブLv</th><td>{owned.awakening * 2}</td><td>→</td><td>{(owned.awakening + 1) * 2}</td></tr>}</tbody></table></>}</div></div>
    {mode === 'awaken' && (!owned ? <><div className="g4g-unlock-cost"><strong>固有魂　{souls} / {unlockCost}</strong><p>必要数 {unlockCost}</p><p>汎用魂は使用できません</p></div><div className="g4g-unlock-cost"><strong>初回解放</strong><p>Lv.1 ・ 覚醒 +0</p><small>銭不要</small></div>{souls < unlockCost && <p role="status">固有魂があと{unlockCost - souls}個必要です。</p>}<div className="g4g-growth-footer">{onCancel && <button type="button" onClick={onCancel}>キャンセル</button>}<button type="button" className="g4g-primary" disabled={souls < unlockCost} onClick={() => void run('character_unlock', { characterId: id })}>解放する</button></div></> : cost > 0 ? <><div className="g4g-growth-section-head"><strong>必要な魂</strong><span>必要数 {specific + common} / {cost}</span></div><div className="g4g-soul-grid"><div className="g4g-soul-choice"><strong>固有魂</strong><small>所持 {souls}</small><Stepper label="覚醒で使う固有魂" value={specific} max={Math.min(souls, cost)} onChange={setSpecific}/></div><div className="g4g-soul-choice"><img src={growthSoulImage('generic_soul', master.rarity)} alt="" width={40} height={40} style={{objectFit:'contain'}}/><strong>{master.rarity}汎用魂</strong><small>所持 {generic}</small><Stepper label="覚醒で使う汎用魂" value={common} max={Math.min(generic, cost)} onChange={n => setSpecific(cost - n)}/></div></div><dl className="g4g-growth-ledger"><div><dt>消費銭</dt><dd>{(cost * 2000).toLocaleString()}</dd></div><div><dt>所持銭</dt><dd>{state.cash.toLocaleString()} → {(state.cash - cost * 2000).toLocaleString()}</dd></div></dl><small className="g4g-growth-note">現在Lv.{owned.level}・EXPは変わりません</small>{common > generic && <p role="status">汎用魂が不足しています。</p>}{specific > souls && <p role="status">固有魂が不足しています。</p>}{state.cash < cost * 2000 && <p role="status">銭が不足しています。</p>}<div className="g4g-growth-footer">{onCancel && <button type="button" onClick={onCancel}>キャンセル</button>}<button type="button" className="g4g-primary" disabled={awakeningDisabled} onClick={async () => { if (await run('character_awaken', { characterId: id, specificSouls: specific, genericSouls: common })) setSpecific(null); }}>覚醒する</button></div></> : <p>最大覚醒です。</p>)}
    {mode === 'exchange' && <><h4>固有魂を汎用魂へ交換</h4><label>固有魂の交換数（10個以上・2個単位）<input aria-label="固有魂の交換数" type="number" min={10} max={souls - souls % 2} step={2} value={amount} onChange={e => { setAmount(Number(e.target.value)); setConfirm(null); }}/></label><dl className="g4g-growth-ledger"><div><dt>固有魂</dt><dd>{souls} → {Math.max(0, souls - amount)}</dd></div><div><dt><img src={growthSoulImage('generic_soul', master.rarity)} alt="" width={28} height={28} style={{objectFit:'contain',verticalAlign:'middle'}}/>{master.rarity}汎用魂</dt><dd>{generic} → {generic + amount / 2}</dd></div></dl><p>銭不要</p><button type="button" disabled={!Number.isSafeInteger(amount) || amount < 10 || amount % 2 !== 0 || amount > souls} onClick={() => setConfirm('exchange')}>交換内容を確認</button>{souls < 10 && <p role="status">交換には固有魂が10個以上必要です。</p>}<h4><img src={growthSoulImage('soul_selector', master.rarity)} alt="" width={32} height={32} style={{objectFit:'contain',verticalAlign:'middle'}}/>{master.rarity}魂選択アイテム：{inventory.soulSelectors[master.rarity]}個</h4><p>1個 → {master.name}の固有魂10個</p><button type="button" disabled={!owned || owned.awakening >= 5 || inventory.soulSelectors[master.rarity] < 1} onClick={() => setConfirm('select')}>この武将の魂を選ぶ</button>{onCancel && !confirm && <button type="button" onClick={onCancel}>キャンセル</button>}</>}
    {confirm && <div role="group" aria-label="魂操作の確認"><p>{confirm === 'exchange' ? `固有魂${amount}個を汎用魂${amount / 2}個へ交換します。元には戻せません。` : `選択アイテム1個を${master.name}の固有魂10個へ変換します。`}</p><div className="g4g-growth-footer"><button type="button" onClick={() => setConfirm(null)}>取消</button><button type="button" className="g4g-primary" onClick={async () => { if (await run(confirm === 'exchange' ? 'soul_exchange' : 'soul_select', { characterId: id, amount: confirm === 'exchange' ? amount : 1 })) { setConfirm(null); setAmount(10); } }}>確定する</button></div></div>}
  </fieldset>;
}

export function GrowthInventoryView({ state }: { state: RedesignState }) {
  const inventory = state.growthInventory ?? emptyGrowthInventory();
  return <details><summary>育成アイテムの所持数</summary>{(['character', 'equipment'] as const).map(kind => <div key={kind}><h4>{kind === 'character' ? '武将EXP' : '装備EXP'}</h4>{EXP_SIZES.map(size => <p key={size}><img src={growthExpImage(kind, size)} alt="" width={28} height={28} style={{objectFit:'contain',verticalAlign:'middle'}}/>{labels[size]}（{EXP_VALUES[size].toLocaleString()} EXP）×{inventory.expItems[kind][size]}</p>)}<p>繰越EXP：{inventory.carryExp[kind]}</p></div>)}<p>スキルLB素材：{state.materials.skill}・装備LB素材：{state.materials.equipmentLb}</p>{(['N', 'R', 'SR', 'SSR'] as const).map(r => <p key={r}><img src={growthSoulImage('generic_soul', r)} alt="" width={28} height={28} style={{objectFit:'contain',verticalAlign:'middle'}}/>{r}汎用魂：{inventory.genericSouls[r]}・<img src={growthSoulImage('soul_selector', r)} alt="" width={28} height={28} style={{objectFit:'contain',verticalAlign:'middle'}}/>{r}魂選択：{inventory.soulSelectors[r]}</p>)}</details>;
}
