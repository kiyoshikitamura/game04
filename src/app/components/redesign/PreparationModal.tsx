'use client';
import { useState } from 'react';
import type { BattleUnit, SkillMaster } from '@/domain/redesign/types';
import CanonicalDialog from '../ui/CanonicalDialog';
import './QuestView.css';
import { TARGET_LABELS, passiveDescription, skillConditionText, skillDescription } from './battleLabels';

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
      <div className="rq-party">{party.map((unit, index) => <button type="button" key={unit.id} onClick={() => setDetail(unit)} aria-label={`${index + 1}番 ${unit.name}のスキル・パッシブ`}>
        <span className="rq-order">{index + 1}</span><img src={unit.image} alt="" /><strong>{unit.name}</strong><span>Lv.{unit.level}</span><span className={`rq-element rq-element-${unit.element}`}>{ELEMENT_LABELS[unit.element]}</span><small>HP {unit.stats.hp.toLocaleString()}</small>
      </button>)}</div>
      <p className="rq-total-sp">合計SP <strong>{commonSpMax ?? '開催時ルールを適用'}</strong></p>
      <p className="rq-muted">挑戦前に表示した行動力を開始時に消費します。</p>
      {party.length !== 5 && <p role="alert">武将を5人編成してください。</p>}
      {energy < energyCost && <p role="alert">行動力が不足しています。</p>}
      {error && <p role="alert">{error}</p>}
    </CanonicalDialog>
    {detail && <CanonicalDialog title={`${detail.name}の詳細`} onClose={() => setDetail(null)} actions={[{ label: '閉じる', onClick: () => setDetail(null) }]}>
      <h3>スキル発動優先順</h3><p>優先1から順に判定し、条件とSPを満たす最初のスキルが発動します。</p>{detail.skills.length === 0 && <p>スキル未設定</p>}
      {detail.skills.map((skill, index) => <article className="rq-detail-item" key={skill.id}><strong>優先{index + 1}：{skill.name}</strong><p>{ELEMENT_LABELS[skill.element]}属性 ／ 消費SP {skill.spCost}</p><p>条件：{skillConditionText(skill)}</p><p>対象：{TARGET_LABELS[skill.target]}</p><p>{skillDescription(skill, commonSpMax !== null)}</p></article>)}
      {detail.passives.length > 0 && <h3>パッシブ</h3>}{detail.passives.map(passive => <article className="rq-detail-item" key={passive.id}><strong>{passive.name} Lv.{passive.level ?? 0}</strong><p>{passiveDescription(passive)}</p></article>)}
    </CanonicalDialog>}
  </div>;
}
