'use client';
import { useState } from 'react';
import { useQuestAssets } from './questAssets';
import type { BattleUnit, OwnedCharacter } from '@/domain/redesign/types';
import CanonicalDialog from '../ui/CanonicalDialog';
import './QuestView.css';
import { passiveDescription, skillDescription } from './battleLabels';
import ElementBadge from './ElementBadge';
import { CHARACTER_MASTERS, getSkillSlots } from '@/domain/redesign/masters';
import localSkills from '@/theme/local-skills.json';
import { CharacterCard, useArtworkPreload, type DisplaySubject } from './visual-bench/CharacterDisplays';

export const ELEMENT_LABELS: Record<string, string> = { fire: '火', water: '水', earth: '土', wind: '風', light: '光', dark: '闇' };
function formalSkillAsset(skill: { id: string; image: string; name: string }) {
  const entry = localSkills.find(candidate => candidate.sourceId === skill.id);
  return { image: entry?.path ?? skill.image, name: entry?.sourceName ?? skill.name };
}
export default function PreparationModal({ party, ownedCharacters, title, energyCost, energy, busy = false, onConfirm, onBack, onOpenDeck, error, commonSpMax = 400 }: {
  ownedCharacters?: OwnedCharacter[]; commonSpMax?: number | null; party: BattleUnit[]; title: string; energyCost: number; energy: number; busy?: boolean;
  onConfirm: () => void | Promise<void>; onBack: () => void; onOpenDeck: () => void; error?: string;
}) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = party.find(unit => unit.id === detailId) ?? null;
  const subjects = party.flatMap(unit => { const master = CHARACTER_MASTERS.find(entry => entry.id === unit.id); return master ? [{ id: master.id, name: unit.name, rarity: master.rarity, element: unit.element } as DisplaySubject] : []; });
  const portraits = useArtworkPreload(subjects, 'card');
  const fallbackImages = useQuestAssets(party.filter(unit => !subjects.some(subject => subject.id === unit.id)).map(unit => unit.image));
  const assets = { ready: portraits.ready && fallbackImages.ready, failed: portraits.failed || fallbackImages.failed, retry: () => { portraits.retry(); fallbackImages.retry(); } };
  const invalidPartySize = party.length < 1 || party.length > 5;
  const detailSlots = detail ? getSkillSlots(ownedCharacters?.find(unit => unit.id === detail.id)?.awakening ?? 0) : 0;
  return <div className="redesign-quest-dialog">
    <CanonicalDialog title="出撃準備" onClose={busy ? undefined : onBack} actions={[
      { label: 'キャンセル', onClick: onBack, disabled: busy },
      { label: busy ? '出撃中…' : '出撃する', onClick: onConfirm, semantic: 'primary', disabled: busy || !assets.ready || energy < energyCost || invalidPartySize },
    ]}>
      <h3>{title}</h3>{!assets.ready && <p role={assets.failed ? "alert" : "status"}>{assets.failed ? <>画像を読み込めませんでした。<button onClick={assets.retry}>再読み込み</button></> : '読み込み中…'}</p>}
      {assets.ready && <div className="rq-party">{party.map((unit, index) => { const master = CHARACTER_MASTERS.find(entry => entry.id === unit.id); const subject = master ? { id: master.id, name: unit.name, rarity: master.rarity, element: unit.element as 'fire'|'water'|'earth'|'wind'|'light'|'dark' } : null; return <button type="button" key={unit.id} className="rq-party-card" disabled={busy || !assets.ready} onClick={() => setDetailId(unit.id)} aria-label={`${index + 1}番 ${unit.name}のスキル・パッシブ`}>
        <span className="rq-order">{index + 1}</span><div className="rq-party-visual-wrap">{subject ? <CharacterCard subject={subject} compact hideMarks className="rq-party-visual-card" /> : <div className="rq-card-visual"><img className="rq-card-person" src={unit.image} alt={unit.name} /></div>}<div className="rq-party-badges"><span className="rq-rarity">{master?.rarity ?? 'N'}</span><ElementBadge element={unit.element} /></div></div><div className="rq-party-meta"><strong>{unit.name}</strong><span className="rq-rarity-line">Lv.{unit.level}</span><small>HP {Math.floor(unit.stats.hp).toLocaleString()}</small></div>
      </button>; })}</div>}
      <p className="rq-total-sp"><img src="/ui/sengoku/07-flower-crest.png" alt="" />共通SP <strong>{commonSpMax === null ? '開催時ルール' : `0 / ${commonSpMax}`}</strong></p>
      <button type="button" className="rq-edit-button" onClick={onOpenDeck} disabled={busy || !assets.ready}>編成変更</button>
      {invalidPartySize && <p role="alert">武将を1〜5人編成してください。</p>}
      {energy < energyCost && <p role="alert">行動力が不足しています。</p>}
      {error && <p role="alert">{error}</p>}
    </CanonicalDialog>
    {detail && <CanonicalDialog title={detail.name} onClose={() => setDetailId(null)} actions={[{ label: '戻る', onClick: () => setDetailId(null) }]}>
      <div className="rq-detail-profile"><div className="rq-detail-visual"><CharacterCard subject={{id: detail.id, name: detail.name, rarity: CHARACTER_MASTERS.find(entry => entry.id === detail.id)?.rarity ?? 'N', element: detail.element as 'fire'|'water'|'earth'|'wind'|'light'|'dark'}} compact hideMarks className="rq-detail-card" /><div className="rq-detail-badges"><span className="rq-rarity">{CHARACTER_MASTERS.find(entry => entry.id === detail.id)?.rarity ?? 'N'}</span><ElementBadge element={detail.element} /><span>Lv.{detail.level}</span></div></div></div>
      <dl className="rq-detail-stats">{Object.entries(detail.stats).filter(([key]) => key !== 'sp').map(([key, value]) => <div key={key}><dt>{key.toUpperCase()}</dt><dd>{(['hp', 'atk', 'def', 'luk'].includes(key) ? Math.floor(value) : value).toLocaleString()}</dd></div>)}</dl>
      <h3>装着スキル</h3><div className="rq-skill-slots">{Array.from({ length: 3 }, (_, index) => { const skill = detail.skills[index]; const asset = skill ? formalSkillAsset(skill) : null; return <article className="rq-detail-item" key={index}><span className="rq-slot-number">{index + 1}</span>{skill && asset ? <>{asset.image && <img className="rq-skill-icon" src={asset.image} alt="" />}<strong>{asset.name}</strong><p className="rq-skill-cost"><ElementBadge element={skill.element} />消費SP {skill.spCost}</p><p>{skillDescription(skill, commonSpMax !== null)}</p></> : <span className="rq-empty-slot">{index < detailSlots ? '未装着' : '未解放'}</span>}</article>; })}</div>
      {detail.passives.length > 0 && <h3>パッシブ</h3>}{detail.passives.map(passive => <article className="rq-detail-item" key={passive.id}><strong>{passive.name} Lv.{passive.level ?? 0}</strong><p>{passiveDescription(passive)}</p></article>)}
    </CanonicalDialog>}
  </div>;
}
