'use client';
import { useState } from 'react';
import type { BattleUnit, SkillMaster } from '@/domain/redesign/types';
import CanonicalDialog from '../ui/CanonicalDialog';
import './QuestView.css';
import { TARGET_LABELS, passiveDescription, skillConditionText, skillDescription } from './battleLabels';
import CardIcon from '../CardIcon';
import AttributeBadge from '../AttributeBadge';
import { CHARACTER_MASTERS } from '@/domain/redesign/masters';

export const ELEMENT_LABELS: Record<string, string> = { fire: '火', water: '水', earth: '土', wind: '風', light: '光', dark: '闇' };
export default function PreparationModal({ party, title, energyCost, energy, busy = false, onConfirm, onBack, onOpenDeck, error, commonSpMax = 400 }: {
  commonSpMax?: number | null; party: BattleUnit[]; title: string; energyCost: number; energy: number; busy?: boolean;
  onConfirm: () => void | Promise<void>; onBack: () => void; onOpenDeck: () => void; error?: string;
}) {
  const [detail, setDetail] = useState<BattleUnit | null>(null);
  return <div className="redesign-quest-dialog">
    <CanonicalDialog title="出撃準備" onClose={busy ? undefined : onBack} actions={[
      { label: '編成変更', onClick: onOpenDeck, disabled: busy },
      { label: '戻る', onClick: onBack, disabled: busy },
      { label: busy ? '出撃中…' : '挑む', onClick: onConfirm, semantic: 'primary', disabled: busy || energy < energyCost || party.length !== 5 },
    ]}>
      <h3>{title}</h3><p className="rq-muted">行動順：左 → 右</p>
      <div className="rq-party">{party.map((unit, index) => { const master = CHARACTER_MASTERS.find(entry => entry.id === unit.id); return <button type="button" key={unit.id} className="rq-party-card" onClick={() => setDetail(unit)} aria-label={`${index + 1}番 ${unit.name}のスキル・パッシブ`}>
        <span className="rq-order">{index + 1}</span><CardIcon rarity={master?.rarity} img={unit.image} jpName={unit.name} attribute={master?.element === 'fire' ? 'EVIL' : master?.element === 'water' ? 'JUSTICE' : master?.element === 'earth' ? 'ORDER' : 'CHAOS'} size={78} showBadge={false} /><div className="rq-party-meta"><strong>{unit.name}</strong><span className="rq-rarity-line"><b>{master?.rarity ?? 'N'}</b><AttributeBadge attribute={master?.element === 'fire' ? 'EVIL' : master?.element === 'water' ? 'JUSTICE' : master?.element === 'earth' ? 'ORDER' : 'CHAOS'} size={18} /> Lv.{unit.level}</span><small>HP {unit.stats.hp.toLocaleString()}</small></div>
      </button>; })}</div>
      <p className="rq-total-sp">合計SP <strong>{commonSpMax ?? '開催時ルールを適用'}</strong></p>
      <p className="rq-muted">挑戦前に表示した行動力を開始時に消費します。</p>
      {party.length !== 5 && <p role="alert">武将を5人編成してください。</p>}
      {energy < energyCost && <p role="alert">行動力が不足しています。</p>}
      {error && <p role="alert">{error}</p>}
    </CanonicalDialog>
    {detail && <CanonicalDialog title={`${detail.name}の詳細`} onClose={() => setDetail(null)} actions={[{ label: '閉じる', onClick: () => setDetail(null) }]}>
      <div className="rq-detail-profile"><CardIcon rarity={CHARACTER_MASTERS.find(entry => entry.id === detail.id)?.rarity} img={detail.image} jpName={detail.name} attribute={CHARACTER_MASTERS.find(entry => entry.id === detail.id)?.element === 'fire' ? 'EVIL' : CHARACTER_MASTERS.find(entry => entry.id === detail.id)?.element === 'water' ? 'JUSTICE' : CHARACTER_MASTERS.find(entry => entry.id === detail.id)?.element === 'earth' ? 'ORDER' : 'CHAOS'} size={160} showBadge={false} /><div><h3>{detail.name}</h3><p className="rq-rarity-line"><b>{CHARACTER_MASTERS.find(entry => entry.id === detail.id)?.rarity ?? 'N'}</b> <AttributeBadge attribute={CHARACTER_MASTERS.find(entry => entry.id === detail.id)?.element === 'fire' ? 'EVIL' : CHARACTER_MASTERS.find(entry => entry.id === detail.id)?.element === 'water' ? 'JUSTICE' : CHARACTER_MASTERS.find(entry => entry.id === detail.id)?.element === 'earth' ? 'ORDER' : 'CHAOS'} size={20} /> · Lv.{detail.level}</p><p>HP {detail.stats.hp.toLocaleString()}</p></div></div>
      <dl className="rq-detail-stats">{Object.entries(detail.stats).map(([key, value]) => <div key={key}><dt>{key.toUpperCase()}</dt><dd>{value.toLocaleString()}</dd></div>)}</dl>
      <h3>装備スキル</h3>{detail.skills.length === 0 && <p>スキル未設定</p>}
      {detail.skills.map((skill, index) => <article className="rq-detail-item" key={skill.id}><div className="rq-skill-head"><img src={skill.image} alt="" /><div><strong>{skill.name}</strong><p><span className={`rq-element rq-element-${skill.element}`}>{ELEMENT_LABELS[skill.element]}</span> ／ 消費SP {skill.spCost}</p></div></div><p>{skill.description || skillDescription(skill, commonSpMax !== null)}</p></article>)}
      {detail.passives.length > 0 && <h3>パッシブ</h3>}{detail.passives.map(passive => <article className="rq-detail-item" key={passive.id}><strong>{passive.name} Lv.{passive.level ?? 0}</strong><p>{passiveDescription(passive)}</p></article>)}
    </CanonicalDialog>}
  </div>;
}
