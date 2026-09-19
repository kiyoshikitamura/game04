'use client';
import { useEffect, useState } from 'react';
import type { BattleResult, BattleUnitState } from '../../../domain/redesign/battle';
import type { BattleUnit, SkillMaster } from '../../../domain/redesign/types';
import styles from './BattleView.module.css';
const elements = { fire: '火', water: '水', earth: '土', wind: '風', light: '光', dark: '闇' };
const statusNames: Record<string, string> = { atk_up: '攻↑', def_up: '防↑', atk_down: '攻↓', def_down: '防↓', poison: '毒' };
interface Props { result: BattleResult; vipActive: boolean; onComplete: () => void; title?: string; raidHp?: { current: number; max: number }; }
export function BattleView({ result, vipActive, onComplete, title = '合戦', raidHp }: Props) {
  const [index, setIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [detail, setDetail] = useState<{ unit?: BattleUnit; state?: BattleUnitState; skill?: SkillMaster } | null>(null);
  const [showLog, setShowLog] = useState(false);
  const frame = result.frames[Math.min(index, result.frames.length - 1)];
  const finished = index >= result.frames.length - 1;
  useEffect(() => { setIndex(0); setPaused(false); setDetail(null); }, [result]);
  useEffect(() => { if (!vipActive && speed > 2) setSpeed(1); }, [vipActive, speed]);
  useEffect(() => {
    if (paused || detail || finished) return;
    const timer = setTimeout(() => setIndex(i => Math.min(i + 1, result.frames.length - 1)), 850 / speed);
    return () => clearTimeout(timer);
  }, [index, paused, detail, finished, speed, result]);
  if (!frame) return <p>戦闘結果を読み込めません。</p>;
  const lookup = (id: string) => result.party.find(u => u.id === id) ?? result.waves[frame.wave - 1]?.find(u => u.id === id);
  const unitCard = (state: BattleUnitState, enemy: boolean, order: number) => {
    const unit = lookup(state.id); if (!unit) return null;
    return <div className={`${enemy ? styles.enemy : styles.member} ${state.hp <= 0 ? styles.dead : ''} ${frame.actorId === state.id ? styles.active : ''}`} key={state.id}>
      <button className={styles.unitButton} onClick={() => setDetail({ unit, state })} aria-label={`${unit.name}の戦闘詳細`}>
        <img src={state.image || unit.image} alt="" className={enemy ? styles.enemyImage : styles.memberImage} />
        <span className={styles.unitName}>{!enemy && `${order + 1}. `}{unit.name}</span>
        <span className={styles.level}>Lv.{unit.level} <b data-element={unit.element}>{elements[unit.element]}</b></span>
        <span className={styles.hp}><span style={{ width: `${100 * state.hp / Math.max(1, state.maxHp)}%` }} /></span>
        <span className={styles.hpNumber}>{state.hp.toLocaleString()} / {state.maxHp.toLocaleString()}</span>
        {enemy && <span className={styles.count}>{state.hp > 0 ? `あと ${state.count}` : '撃破'}</span>}
        {state.phase && <span className={styles.phase}>{state.phase}</span>}
        <span className={styles.status}>{state.statuses.slice(0, 3).map((s, i) => <span key={i}>{statusNames[s.type] ?? s.type}</span>)}</span>
      </button>
      {!enemy && <span className={styles.skills}>{unit.skills.slice(0, 3).map(skill => {
        const eligible = skill.condition.type === 'always' || skill.condition.type === 'hp_below' && state.hp / state.maxHp <= (skill.condition.value ?? .5) || skill.condition.type === 'ally_hp_below' && frame.party.some(u => u.hp > 0 && u.hp / u.maxHp <= (skill.condition.value ?? .5)) || skill.condition.type === 'ally_dead' && frame.party.some(u => u.hp <= 0) || skill.condition.type === 'enemy_count' && frame.enemies.filter(u => u.hp > 0).length >= (skill.condition.value ?? 1) || skill.condition.type === 'every_n_actions' && (state.actions + 1) % Math.max(1, skill.condition.value ?? 1) === 0;
        const active = frame.actorId === unit.id && frame.skillId === skill.id;
        const status = !eligible ? '条件未達' : frame.partySp < Math.ceil(skill.spCost * (frame.burst ? .5 : 1)) ? 'SP不足' : '発動可能';
        return <button key={skill.id} className={`${styles.skill} ${active ? styles.skillActive : !eligible ? styles.condition : status === 'SP不足' ? styles.shortSp : ''}`} title={`${skill.name}：${active ? '発動中' : status}`} aria-label={`${skill.name}：${active ? '発動中' : status}`} onClick={() => setDetail({ skill })}><img src={skill.image} alt="" /><span>{active ? '発動' : !eligible ? '条件' : status === 'SP不足' ? 'SP' : '可'}</span></button>;
      })}</span>}
    </div>;
  };
  return <section className={styles.battle} aria-label={title}>
    <header className={styles.header}><strong>WAVE {frame.wave}/{result.waves.length}</strong><div><button onClick={() => setSpeed(s => s >= (vipActive ? 3 : 2) ? 1 : s + 1)}>×{speed}</button><button onClick={() => setPaused(p => !p)} disabled={finished}>{paused ? '再開' : '一時停止'}</button>{vipActive && <button disabled={finished} onClick={() => setIndex(result.frames.length - 1)}>SKIP</button>}</div></header>
    {raidHp && <div className={styles.raidHp}>レイド共通HP <span>{raidHp.current.toLocaleString()} / {raidHp.max.toLocaleString()}</span></div>}
    <div className={styles.enemyZone}>{frame.enemies.map((u, i) => unitCard(u, true, i))}</div>
    <div className={`${styles.burst} ${frame.burst ? styles.burstOn : ''}`}>{frame.burst ? 'BURST — 連撃' : 'BURST'}</div>
    <div className={styles.spLabel}>共通SP <strong>{frame.partySp} / {frame.maxSp}</strong></div>
    <div className={styles.sp}><span style={{ width: `${100 * frame.partySp / Math.max(1, frame.maxSp)}%` }} /></div>
    <div className={styles.feedback} key={frame.index}>{frame.text}</div>
    <div className={styles.party}>{frame.party.map((u, i) => unitCard(u, false, i))}</div>
    {finished && <div className={styles.result}><h2>{result.outcome === 'win' ? '勝利' : result.outcome === 'lose' ? '敗北' : '撤退'}</h2><p>{result.wavesCleared} Wave突破 · 総ダメージ {result.totalDamage.toLocaleString()}</p><details><summary>戦果と編成の分析</summary><div className={styles.tableWrap}><table><thead><tr><th>武将</th><th>与ダメージ</th><th>回復</th><th>SP獲得</th><th>BURST</th></tr></thead><tbody>{result.analysis.map(a => <tr key={a.id}><th>{a.name}</th><td>{a.damage.toLocaleString()}</td><td>{a.healing.toLocaleString()}</td><td>{a.spGenerated}</td><td>{a.bursts}</td></tr>)}</tbody></table></div><p>敵の属性・行動カウントを見直し、編成順とスキルを調整できます。</p></details><button onClick={() => setShowLog(true)}>戦闘ログ</button><button className={styles.primary} onClick={onComplete}>結果へ</button></div>}
    {(detail || showLog) && <div className={styles.backdrop} onClick={() => { setDetail(null); setShowLog(false); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-label={showLog ? '戦闘ログ' : '戦闘詳細'} onClick={e => e.stopPropagation()}><button className={styles.close} onClick={() => { setDetail(null); setShowLog(false); }}>閉じる</button>{showLog ? <><h2>戦闘ログ</h2>{result.frames.map(f => <p key={f.index}>W{f.wave} {f.text}</p>)}</> : detail?.skill ? <><h2>{detail.skill.name}</h2><p>消費SP {detail.skill.spCost} · {elements[detail.skill.element]}</p><p>{detail.skill.description}</p><p>条件：{conditionText(detail.skill)}</p></> : detail?.unit && <><h2>{detail.unit.name}</h2><p>HP {detail.state?.hp} / {detail.state?.maxHp}</p>{detail.state && result.waves[frame.wave - 1]?.some(u => u.id === detail.unit?.id) && <p>SP {detail.state.sp} / {detail.state.maxSp} · あと {detail.state.count} 行動で割り込み</p>}<h3>パッシブ</h3>{detail.unit.passives.map((p, i) => <p key={`${p.id}-${i}`}>{p.name} · {p.stat.toUpperCase()} +{p.percent}%</p>)}<h3>スキル</h3>{detail.unit.skills.map(s => <p key={s.id}><strong>{s.name}</strong>（SP {s.spCost}）<br />{conditionText(s)}<br />{s.description}</p>)}<h3>状態</h3>{detail.state?.statuses.length ? detail.state.statuses.map((s, i) => <p key={i}>{statusNames[s.type] ?? s.type} {s.power}% · 残り{s.remaining}行動</p>) : <p>なし</p>}</>}</section></div>}
  </section>;
}
function conditionText(s: SkillMaster) { const value = s.condition.value ?? .5; switch (s.condition.type) { case 'hp_below': return `自身のHP ${value * 100}%以下`; case 'ally_hp_below': return `味方のHP ${value * 100}%以下`; case 'enemy_count': return `敵が${value}体以上`; case 'ally_dead': return '戦闘不能の味方がいる'; case 'every_n_actions': return `${value}行動ごと`; default: return '常時'; } }
export default BattleView;
