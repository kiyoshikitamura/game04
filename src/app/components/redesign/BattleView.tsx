'use client';
import { characterArt } from '@/theme/creativeAssets';
import { useEffect, useState } from 'react';
import type { BattleResult, BattleUnitState } from '../../../domain/redesign/battle';
import type { BattleUnit, SkillMaster } from '../../../domain/redesign/types';
import styles from './BattleView.module.css';
import Modal from './Modal';
import ElementBadge from './ElementBadge';
import { STATUS_LABELS, TARGET_LABELS, passiveDescription, skillConditionText, READINESS_REASONS, CLEANSE_LABELS, skillDescription, LEGACY_SKILL_MAPPING_NOTICE } from './battleLabels';

const elements = { fire: '火', water: '水', earth: '土', wind: '風', light: '光', dark: '闇' };
const statusNames = STATUS_LABELS;
const readinessNames: Record<string, string> = { ready: '発動可能', insufficient_sp: 'SP不足', condition_unmet: '条件未達', active: '発動中' };
const reasonNames: Record<string, string> = { action_limit: '300回の味方行動機会で未決着のため敗北', party_defeated: '味方全員が戦闘不能', mutual_annihilation: '双方全滅のため敗北', final_wave_defeated: '最終Waveの敵を撃破' };
const reasonText = (reason: string) => reasonNames[reason] ?? reason;
const eventText = (text: string) => text.replace(/\b(atk_up|def_up|atk_down|def_down|stun|dot|hot|shield|taunt|counter|cleanse)\b/g, key => statusNames[key]);
const signed = (value: number) => `${value > 0 ? '+' : ''}${value}`;
const meterWidth = (value: number, max: number) => `${Math.max(0, Math.min(100, 100 * value / Math.max(1, max)))}%`;
// Playback timing only; structural frames remain available in the complete log.
function frameDuration(event?: string) {
  if (!event) return 850; // Saved legacy replay timing.
  if (['counts', 'action_end', 'interrupt_end'].includes(event)) return 60;
  if (['phase', 'burst_start', 'burst_failed', 'burst_interrupted', 'wave', 'death', 'revive'].includes(event)) return 600;
  if (['action_start', 'damage', 'heal', 'stun_skip'].includes(event)) return 400;
  return 250;
}
interface Props { result: BattleResult; vipActive: boolean; onComplete: () => void; title?: string; raidHp?: { current: number; max: number }; initialFrame?: number; initialPaused?: boolean; }

/** Presentation only: every state, skill decision and result comes from the recorded server frames. */
export function BattleView({ result, vipActive, onComplete, title = '合戦', raidHp, initialFrame = 0, initialPaused = false }: Props) {
  const [index, setIndex] = useState(initialFrame);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(initialPaused);
  const [detail, setDetail] = useState<{ unit?: BattleUnit; state?: BattleUnitState; skill?: SkillMaster; readiness?: string; cost?: number; reason?: string } | null>(null);
  const [showLog, setShowLog] = useState(false);
  const frame = result.frames[Math.min(index, result.frames.length - 1)];
  const finished = index >= result.frames.length - 1;
  useEffect(() => { setIndex(initialFrame); setPaused(initialPaused); setDetail(null); setShowLog(false); }, [result, initialFrame, initialPaused]);
  useEffect(() => { if (!vipActive && speed > 2) setSpeed(1); }, [vipActive, speed]);
  useEffect(() => {
    if (paused || detail || showLog || finished) return;
    const timer = setTimeout(() => setIndex(i => Math.min(i + 1, result.frames.length - 1)), frameDuration(frame?.event) / speed);
    return () => clearTimeout(timer);
  }, [index, paused, detail, showLog, finished, speed, result, frame?.event]);
  useEffect(() => {
    if (!detail && !showLog) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setDetail(null); setShowLog(false); } };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [detail, showLog]);
  if (!frame) return <p>戦闘結果を読み込めません。</p>;
  const lookup = (id: string, wave = frame.wave) => result.party.find(u => u.id === id) ?? result.waves[wave - 1]?.find(u => u.id === id);
  const close = () => { setDetail(null); setShowLog(false); };
  const unitCard = (state: BattleUnitState, enemy: boolean, order: number) => {
    const unit = lookup(state.id); if (!unit) return null;
    return <div className={`${enemy ? styles.enemy : styles.member} ${state.hp <= 0 ? styles.dead : ''} ${frame.actorId === state.id ? styles.active : ''}`} key={state.id}>
      <button className={styles.unitButton} onClick={() => setDetail({ unit, state })} aria-label={`${unit.name}の戦闘詳細`}>
        {characterArt(unit, enemy ? 'battle' : 'card') ? <img src={characterArt(unit, enemy ? 'battle' : 'card')} alt="" className={enemy ? styles.enemyImage : styles.memberImage} /> : <span className={styles.enemyImage} role="img" aria-label={`${unit.name}の画像は未接続`}>画像未接続</span>}
        <span className={styles.unitName}>{!enemy && `${order + 1}. `}{unit.name}</span>
        <span className={styles.level}>Lv.{unit.level} <ElementBadge element={unit.element}/></span>
        <span className={styles.hp}><span style={{ width: meterWidth(state.hp, state.maxHp) }} /></span>
        <span className={styles.hpNumber}>{state.hp.toLocaleString()} / {state.maxHp.toLocaleString()}</span>
        {enemy && <span className={styles.count}>{state.hp > 0 ? `あと ${state.count}` : '撃破'}</span>}
        {state.phase && <span className={styles.phase}>{state.phase}</span>}
        <span className={styles.status}>{state.statuses.slice(0, 3).map((s, i) => <span key={i} title={`${statusNames[s.type] ?? s.type} 残り${s.remaining}回`}>{statusNames[s.type] ?? s.type}{s.type === 'shield' ? ` ${s.amount ?? 0}` : ` ${s.remaining}`}</span>)}{state.statuses.length > 3 && <span>ほか{state.statuses.length - 3}件</span>}{state.stunImmune && <span title="実際に1回行動するまで行動不能の再付与を防ぎます">耐性</span>}</span>
      </button>
      {!enemy && <span className={styles.skills}>{(state.skills ?? unit.skills).slice(0, 3).map((skill, slot) => {
        const recorded = frame.skillStates?.[unit.id]?.find(entry => entry.skillId === skill.id);
        const active = recorded ? recorded.status === 'active' : !frame.skillStates && frame.actorId === unit.id && frame.skillId === skill.id;
        const status = active ? '発動中' : recorded?.reason === 'reapply_unavailable' ? '再付与不可' : recorded ? readinessNames[recorded.status] ?? recorded.status : '記録なし';
        return <button key={skill.id} className={`${styles.skill} ${active ? styles.skillActive : recorded?.status === 'condition_unmet' ? styles.condition : recorded?.status === 'insufficient_sp' ? styles.shortSp : ''}`} title={`優先${slot + 1} ${skill.name}：${status}`} aria-label={`優先${slot + 1} ${skill.name}：${status}`} onClick={() => setDetail({ skill, readiness: status, cost: recorded?.cost, reason: recorded?.reason })}>
          <img src={skill.image} alt="" /><span>{slot + 1} {active ? '発動' : recorded?.reason === 'reapply_unavailable' ? '残存' : recorded?.status === 'condition_unmet' ? '条件' : recorded?.status === 'insufficient_sp' ? 'SP' : recorded?.status === 'ready' ? '可' : '—'}</span>
        </button>;
      })}</span>}
    </div>;
  };
  return <section className={styles.battle} aria-label={title}>
    <header className={styles.header}><strong>WAVE {frame.wave}/{result.waves.length}</strong><div><button onClick={() => setSpeed(s => s >= (vipActive ? 3 : 2) ? 1 : s + 1)}>×{speed}</button><button onClick={() => setPaused(p => !p)} disabled={finished}>{paused ? '再開' : '一時停止'}</button>{vipActive && <button disabled={finished} onClick={() => setIndex(result.frames.length - 1)}>SKIP</button>}</div></header>
    {frame.remainingActions !== undefined && <p className={styles.actionLimit}>残り味方行動機会 <strong>{frame.remainingActions}</strong> / 300</p>}
    {raidHp && <div className={styles.raidHp}>レイド共通HP <span>{raidHp.current.toLocaleString()} / {raidHp.max.toLocaleString()}</span></div>}
    <div className={styles.enemyZone}>{frame.enemies.map((u, i) => unitCard(u, true, i))}</div>
    <div className={`${styles.burst} ${frame.burst ? styles.burstOn : ''}`}>{frame.burst ? 'BURST — 連撃' : 'BURST'}</div>
    <div className={styles.spLabel}>共通SP <strong>{frame.partySp} / {frame.maxSp}</strong></div>
    <div className={styles.sp} role="meter" aria-label="共通SP" aria-valuemin={0} aria-valuemax={frame.maxSp} aria-valuenow={frame.partySp}><span style={{ width: meterWidth(frame.partySp, frame.maxSp) }} /></div>
    {frame.burstGauge !== undefined && <><div className={styles.spLabel}>バーストゲージ <strong>{frame.burstGauge} / {frame.maxBurstGauge ?? 200}</strong></div><div className={`${styles.sp} ${styles.gauge}`} role="meter" aria-label="バーストゲージ" aria-valuemin={0} aria-valuemax={frame.maxBurstGauge ?? 200} aria-valuenow={frame.burstGauge}><span style={{ width: meterWidth(frame.burstGauge, frame.maxBurstGauge ?? 200) }} /></div></>}
    <div className={styles.feedback} key={frame.index}>{eventText(frame.text)}{frame.hits && frame.hits.length > 1 && <small className={styles.hitBreakdown}>ヒット表示：{frame.hits.join(' + ')}</small>}</div>
    <div className={styles.party}>{frame.party.map((u, i) => unitCard(u, false, i))}</div>
    {finished && <div className={styles.result}><h2>{result.outcome === 'win' ? '勝利' : result.outcome === 'lose' ? '敗北' : '行動上限'}</h2><p>{frame.reason ? reasonText(frame.reason) : eventText(frame.text)}</p><p>{result.wavesCleared} Wave突破 · 総ダメージ {result.totalDamage.toLocaleString()}</p><details><summary>戦果と編成の分析</summary><div className={styles.tableWrap}><table><thead><tr><th>武将</th><th>与ダメージ</th><th>回復</th><th>SP獲得</th><th>BURST</th></tr></thead><tbody>{result.analysis.map(a => <tr key={a.id}><th>{a.name}</th><td>{a.damage.toLocaleString()}</td><td>{a.healing.toLocaleString()}</td><td>{a.spGenerated}</td><td>{a.bursts}</td></tr>)}</tbody></table></div><p>敵の属性・行動カウントを見直し、編成順とスキル優先順を調整できます。</p></details><button onClick={() => setShowLog(true)}>戦闘ログ</button><button className={styles.primary} onClick={onComplete}>結果へ</button></div>}
    {(detail || showLog) && <Modal title={showLog ? '戦闘ログ' : detail?.skill?.name ?? detail?.unit?.name ?? '戦闘詳細'} onClose={close}>{showLog ? <>
      {result.frames.map(f => <article className={styles.logEntry} key={f.index}><strong>#{f.index + 1} W{f.wave} {f.actorId ? lookup(f.actorId, f.wave)?.name ?? f.actorId : ''}</strong><p>{eventText(f.text)}</p>{f.targetIds?.length ? <p>対象：{f.targetIds.map(id => lookup(id, f.wave)?.name ?? id).join('、')}</p> : null}<p>SP {f.partySp}/{f.maxSp}{f.spDelta !== undefined ? ` (${signed(f.spDelta)})` : ''}{f.burstGauge !== undefined ? ` · ゲージ ${f.burstGauge}/${f.maxBurstGauge ?? 200}` : ''}{f.gaugeDelta !== undefined ? ` (${signed(f.gaugeDelta)})` : ''}{f.remainingActions !== undefined ? ` · 残り${f.remainingActions}回` : ''}</p><p>敵SP：{f.enemies.map(enemy => `${lookup(enemy.id, f.wave)?.name ?? enemy.id} ${enemy.sp}/${enemy.maxSp}`).join(' · ')}</p>{f.hits && f.hits.length > 1 && <p>ヒット表示：{f.hits.join(' + ')}</p>}{f.reason && <p>{reasonText(f.reason)}</p>}</article>)}
    </> : detail?.skill ? <><p>{detail.readiness}{detail.cost !== undefined ? ` · 今回の消費SP ${detail.cost}` : ''}</p>{detail.reason && <p>{result.rulesVersion === 'balance-v2-20260920' && detail.skill.unsupportedReason ? LEGACY_SKILL_MAPPING_NOTICE : READINESS_REASONS[detail.reason] ?? detail.reason}</p>}<p>基本消費SP {detail.skill.spCost} · {elements[detail.skill.element]}</p><p>{skillDescription(detail.skill, result.rulesVersion === 'balance-v2-20260920')}</p><p>条件：{skillConditionText(detail.skill)}</p><p>対象：{TARGET_LABELS[detail.skill.target] ?? detail.skill.target}</p><p>効果順：{detail.skill.effects.map(effect => `${STATUS_LABELS[effect.type] ?? effect.type}${effect.cleanseCategory ? `（${CLEANSE_LABELS[effect.cleanseCategory]}）` : ''}`).join(' → ')}</p></> : detail?.unit && <><p>HP {detail.state?.hp} / {detail.state?.maxHp}</p>{detail.state && result.waves[frame.wave - 1]?.some(u => u.id === detail.unit?.id) && <p>SP {detail.state.sp} / {detail.state.maxSp} · あと {detail.state.count} 行動で割り込み</p>}{detail.unit.passives.length > 0 && <><h3>パッシブ</h3>{detail.unit.passives.map((p, i) => <p key={`${p.id}-${i}`}><strong>{p.name} Lv.{p.level ?? 0}</strong><br />{passiveDescription(p)}{detail.state?.passiveEffects?.find(entry=>entry.id===p.id) && <><br />記録時：{detail.state.passiveEffects.find(entry=>entry.id===p.id)?.active ? '条件成立' : '条件不成立・無効'}</>}</p>)}</>}<h3>スキル発動優先順</h3>{(detail.state?.skills ?? detail.unit.skills).map((s, slot) => <p key={s.id}><strong>優先{slot + 1}：{s.name}</strong>（SP {s.spCost}）<br />{skillConditionText(s)}<br />{skillDescription(s, result.rulesVersion === 'balance-v2-20260920')}</p>)}<h3>状態</h3>{detail.state?.statuses.length ? detail.state.statuses.map((s, i) => <p key={i}>{statusNames[s.type] ?? s.type} {s.type === 'shield' ? `残量 ${(s.amount ?? 0).toLocaleString()}` : ['dot','hot'].includes(s.type) ? `保持基礎量 ${s.amount ?? 0}` : ['stun','taunt'].includes(s.type) ? '' : `${s.power}%`} · 残り{s.remaining}回{s.sourceSkillId ? ` · 付与元 ${s.sourceSkillId}` : ''}</p>) : <p>なし</p>}{detail.state?.stunImmune && <p>行動不能の再付与耐性：次の実行行動完了まで</p>}</>}</Modal>}
  </section>;
}
export default BattleView;

