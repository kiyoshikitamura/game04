'use client';
import { useState } from 'react';
import type { BattleUnit, SkillMaster } from '@/domain/redesign/types';
import CanonicalDialog from '../ui/CanonicalDialog';
import './QuestView.css';

export const ELEMENT_LABELS: Record<string, string> = { fire: '火', water: '水', earth: '土', wind: '風', light: '光', dark: '闇' };
const TARGET_LABELS: Record<string, string> = { first: '先頭の敵', lowest_hp: 'HPの低い敵', highest_hp: 'HPの高い敵', random: 'ランダムな敵', all_enemies: '敵全体', lowest_ally: 'HPの低い味方', all_allies: '味方全体', self: '自身', dead_ally: '戦闘不能の味方' };
function conditionLabel(skill: SkillMaster) {
  const condition = skill.condition;
  if (condition.type === 'hp_below') return `自身のHP ${Math.round((condition.value ?? .5) * 100)}%以下`;
  if (condition.type === 'ally_hp_below') return `味方のHP ${Math.round((condition.value ?? .5) * 100)}%以下`;
  if (condition.type === 'every_n_actions') return `${condition.value ?? 1}行動ごと`;
  if (condition.type === 'enemy_count') return `敵が${condition.value ?? 1}体以上`;
  if (condition.type === 'ally_dead') return '戦闘不能の味方がいる';
  return '常時';
}
export default function PreparationModal({ party, title, energyCost, energy, busy = false, onConfirm, onBack, onOpenDeck, error }: {
  party: BattleUnit[]; title: string; energyCost: number; energy: number; busy?: boolean;
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
      <div className="rq-party">{party.map((unit, index) => <button type="button" key={unit.id} onClick={() => setDetail(unit)} aria-label={`${index + 1}番 ${unit.name}のスキル・パッシブ`}>
        <span className="rq-order">{index + 1}</span><img src={unit.image} alt="" /><strong>{unit.name}</strong><span>Lv.{unit.level}</span><span className={`rq-element rq-element-${unit.element}`}>{ELEMENT_LABELS[unit.element]}</span><small>HP {unit.stats.hp.toLocaleString()}</small>
      </button>)}</div>
      <p className="rq-total-sp">パーティ共通SP最大値 <strong>{party.reduce((sum, unit) => sum + unit.stats.sp, 0).toLocaleString()}</strong></p>
      <p>消費行動力 {energyCost} ／ 所持 {energy}</p>
      <p className="rq-muted">挑戦開始時に消費します。敗北した場合も返却されません。</p>
      {party.length !== 5 && <p role="alert">武将を5人編成してください。</p>}
      {energy < energyCost && <p role="alert">行動力が不足しています。</p>}
      {error && <p role="alert">{error}</p>}
    </CanonicalDialog>
    {detail && <CanonicalDialog title={`${detail.name}の詳細`} onClose={() => setDetail(null)} actions={[{ label: '閉じる', onClick: () => setDetail(null) }]}>
      <h3>スキル</h3>{detail.skills.length === 0 && <p>スキル未設定</p>}
      {detail.skills.map(skill => <article className="rq-detail-item" key={skill.id}><strong>{skill.name}</strong><p>{ELEMENT_LABELS[skill.element]}属性 ／ 消費SP {skill.spCost}</p><p>条件：{conditionLabel(skill)}</p><p>対象：{TARGET_LABELS[skill.target]}</p><p>{skill.description}</p></article>)}
      <h3>パッシブ</h3>{detail.passives.map(passive => <article className="rq-detail-item" key={passive.id}><strong>{passive.name} Lv.{passive.level ?? 0}</strong><p>{passive.target === 'party' ? 'パーティ全体' : '自身'}の{passive.stat.toUpperCase()} +{Math.round(passive.percent)}%</p></article>)}
    </CanonicalDialog>}
  </div>;
}
