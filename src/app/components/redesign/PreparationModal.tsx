'use client';
import { useState } from 'react';
import type { BattleUnit } from '@/domain/redesign/types';
import CanonicalDialog from '../ui/CanonicalDialog';
import './QuestView.css';
import { passiveDescription, skillDescription } from './battleLabels';
import ElementBadge from './ElementBadge';
import { CHARACTER_MASTERS } from '@/domain/redesign/masters';
import { getRarityFrameAsset } from '@/utils/rarityAssets';
import localSkills from '@/theme/local-skills.json';
import { characterArt } from '@/theme/creativeAssets';

export const ELEMENT_LABELS: Record<string, string> = { fire: '火', water: '水', earth: '土', wind: '風', light: '光', dark: '闇' };
function displaySkillDescription(description: string) {
  return description.replace(/（個別倍率・消費SP・回復式は開発仮設定）$/, '');
}
function formalSkillAsset(skill: { id: string; image: string; name: string }) {
  const entry = localSkills.find(candidate => candidate.sourceId === skill.id);
  return { image: entry?.path ?? skill.image, name: entry?.sourceName ?? skill.name };
}
export default function PreparationModal({ party, title, energyCost, energy, busy = false, onConfirm, onBack, onOpenDeck, error, commonSpMax = 400 }: {
  commonSpMax?: number | null; party: BattleUnit[]; title: string; energyCost: number; energy: number; busy?: boolean;
  onConfirm: () => void | Promise<void>; onBack: () => void; onOpenDeck: () => void; error?: string;
}) {
  const [detail, setDetail] = useState<BattleUnit | null>(null);
  return <div className="redesign-quest-dialog">
    <CanonicalDialog title="出撃準備" onClose={busy ? undefined : onBack} actions={[
      { label: '戻る', onClick: onBack, disabled: busy },
      { label: busy ? '出撃中…' : '挑む', onClick: onConfirm, semantic: 'primary', disabled: busy || energy < energyCost || party.length !== 5 },
    ]}>
      <h3>{title}</h3>
      <div className="rq-party">{party.map((unit, index) => { const master = CHARACTER_MASTERS.find(entry => entry.id === unit.id); return <button type="button" key={unit.id} className="rq-party-card" onClick={() => setDetail(unit)} aria-label={`${index + 1}番 ${unit.name}のスキル・パッシブ`}>
        <span className="rq-order">{index + 1}</span><div className="rq-card-visual"><img className="rq-card-person" src={characterArt(unit, 'card') ?? unit.image} alt="" /><img className="rq-card-frame" src={getRarityFrameAsset('character', master?.rarity ?? 'N')} alt="" /><ElementBadge element={unit.element} className="rq-card-element" /></div><div className="rq-party-meta"><strong>{unit.name}</strong><span className="rq-rarity-line"><b>{master?.rarity ?? 'N'}</b> <ElementBadge element={unit.element} /> Lv.{unit.level}</span><small>HP {unit.stats.hp.toLocaleString()}</small></div>
      </button>; })}</div>
      <p className="rq-total-sp">合計SP <strong>{commonSpMax ?? '開催時ルールを適用'}</strong></p>
      <button type="button" className="rq-edit-button" onClick={onOpenDeck} disabled={busy}>編成変更</button>
      {party.length !== 5 && <p role="alert">武将を5人編成してください。</p>}
      {energy < energyCost && <p role="alert">行動力が不足しています。</p>}
      {error && <p role="alert">{error}</p>}
    </CanonicalDialog>
    {detail && <CanonicalDialog title={`${detail.name}の詳細`} onClose={() => setDetail(null)} actions={[{ label: '閉じる', onClick: () => setDetail(null) }]}>
      <div className="rq-detail-profile"><div className="rq-character-visual"><img className="rq-character-person" src={characterArt(detail, 'portrait') ?? detail.image} alt={detail.name} /><img className="rq-character-frame" src={getRarityFrameAsset('character', CHARACTER_MASTERS.find(entry => entry.id === detail.id)?.rarity ?? 'N')} alt="" /></div><div><h3>{detail.name}</h3><p className="rq-rarity-line"><b>{CHARACTER_MASTERS.find(entry => entry.id === detail.id)?.rarity ?? 'N'}</b> <ElementBadge element={detail.element} /> · Lv.{detail.level}</p><p>HP {detail.stats.hp.toLocaleString()}</p></div></div>
      <dl className="rq-detail-stats">{Object.entries(detail.stats).map(([key, value]) => <div key={key}><dt>{key.toUpperCase()}</dt><dd>{value.toLocaleString()}</dd></div>)}</dl>
      <h3>装備スキル</h3>{detail.skills.length === 0 && <p>スキル未設定</p>}
      {detail.skills.map((skill) => { const asset = formalSkillAsset(skill); return <article className="rq-detail-item" key={skill.id}><div className="rq-skill-head"><img src={asset.image} alt="" /><div><strong>{asset.name}</strong><p><ElementBadge element={skill.element} /> ／ 消費SP {skill.spCost}</p></div></div><p>{displaySkillDescription(skill.description || skillDescription(skill, commonSpMax !== null))}</p></article>; })}
      {detail.passives.length > 0 && <h3>パッシブ</h3>}{detail.passives.map(passive => <article className="rq-detail-item" key={passive.id}><strong>{passive.name} Lv.{passive.level ?? 0}</strong><p>{passiveDescription(passive)}</p></article>)}
    </CanonicalDialog>}
  </div>;
}
