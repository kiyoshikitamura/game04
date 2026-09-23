import type { ReactNode } from 'react';
import './RaidApprovedVisual.css';

export type RaidApprovedIcon = 'clock' | 'people' | 'swords' | 'scroll' | 'handshake' | 'chest' | 'armor' | 'victory' | 'medal';

export function RaidApprovedIcon({ name, className = '' }: { name: RaidApprovedIcon; className?: string }) {
  return <img className={`raid-approved-visual__icon ${className}`} src={`/ui/raid/${name}.svg`} alt="" />;
}

export interface RaidApprovedCardData {
  backgroundUrl?: string;
  characterUrl?: string;
  bossName: string;
  attributeLabel: string;
  attributeIconUrl?: string;
  ownerName: string;
  ownerImageUrl?: string;
  hpPercent: number | null;
  hpText: string;
  remainingLabel: string;
  participantLabel: string;
  badgeLabel: string;
  statusLabel: string;
}

export function RaidApprovedCard({ data, resolve = value => value, action }: { data: RaidApprovedCardData; resolve?: (url: string) => string; action: ReactNode }) {
  return <article className="raid-approved-card">
    <div className="raid-approved-card__art">{data.backgroundUrl && <img src={resolve(data.backgroundUrl)} alt="" />}{data.characterUrl && <img src={resolve(data.characterUrl)} alt="" />}</div>
    <div className="raid-approved-card__copy">
      <div className="raid-approved-card__badges"><span>{data.badgeLabel}</span><span>{data.statusLabel}</span></div>
      <h3>{data.bossName} <small>Lv.1</small></h3>
      <p className="raid-approved-card__attribute">{data.attributeIconUrl && <img src={resolve(data.attributeIconUrl)} alt="" />}{data.attributeLabel}属性</p>
      <div className="raid-approved-card__owner">{data.ownerImageUrl ? <img src={resolve(data.ownerImageUrl)} alt="" /> : <span />}<strong>開催者　{data.ownerName}</strong></div>
      <div className="raid-approved-card__hp"><div><span style={{ width: `${data.hpPercent ?? 0}%` }} /></div><strong>{data.hpText}</strong></div>
    </div>
    <div className="raid-approved-card__footer"><div><span><RaidApprovedIcon name="clock" />{data.remainingLabel}</span><span><RaidApprovedIcon name="people" />{data.participantLabel}</span></div>{action}</div>
  </article>;
}

export interface RaidApprovedDetailData {
  areaLabel: string;
  bossName: string;
  backgroundUrl?: string;
  characterUrl?: string;
  ownerName: string;
  ownerImageUrl?: string;
  guildLabel: string;
  hpPercent: number | null;
  hpValueLabel: string;
  remainingLabel: string;
  expiryLabel: string;
  participantLabel: string;
  faces?: Array<{ id: string; url: string; name: string }>;
}

export function RaidApprovedDetailVisual({ data, resolve = value => value, compact = false, actions, contribution, challenge }: { data: RaidApprovedDetailData; resolve?: (url: string) => string; compact?: boolean; actions: ReactNode; contribution: ReactNode; challenge: ReactNode }) {
  return <div className="raid-approved-detail">
    {compact && <div className="raid-approved-detail__compact">{data.ownerImageUrl ? <img src={resolve(data.ownerImageUrl)} alt={data.ownerName} /> : <span />}<div><strong>{data.bossName} <small>Lv.1</small></strong><span>開催者　{data.ownerName}</span></div><b>{data.hpValueLabel}</b></div>}
    <section className={`raid-approved-detail__hero${compact ? ' is-compact' : ''}`}><img className="raid-approved-detail__background" src={data.backgroundUrl ? resolve(data.backgroundUrl) : undefined} alt="" /><img className="raid-approved-detail__character" src={data.characterUrl ? resolve(data.characterUrl) : undefined} alt="" />{!compact && <div className="raid-approved-detail__hero-copy"><span>{data.areaLabel}</span><h2>{data.bossName}</h2></div>}</section>
    {!compact && <><section className="raid-approved-detail__owner">{data.ownerImageUrl ? <img src={resolve(data.ownerImageUrl)} alt={data.ownerName} /> : <span />}<div><strong>開催者　{data.ownerName}</strong></div></section>
    <section className="raid-approved-detail__battle"><div className="raid-approved-detail__hp"><div><span style={{ width: `${data.hpPercent ?? 0}%` }} /></div><strong>{data.hpValueLabel}</strong></div><div className="raid-approved-detail__facts"><span><RaidApprovedIcon name="clock" />{data.remainingLabel}</span><span><RaidApprovedIcon name="people" />{data.participantLabel}</span></div></section></>}
    <nav className="raid-approved-detail__actions">{actions}</nav>
    {contribution}
    {challenge}
  </div>;
}

export function RaidApprovedContribution({ damageLabel, damageValue, battlesLabel, eligibilityLabel, completed = 0 }: { damageLabel: string; damageValue: string; battlesLabel: string; eligibilityLabel: string; completed?: number }) {
  return <section className="raid-approved-detail__contribution"><h2>自分の貢献</h2><div className="raid-approved-detail__damage"><RaidApprovedIcon name="swords" /><span>貢献ダメージ<strong>{damageValue}</strong></span><b>{damageLabel}</b></div><div className="raid-approved-detail__stats"><span><RaidApprovedIcon name="armor" />挑戦　{battlesLabel}</span><span><RaidApprovedIcon name="victory" />勝利　{completed}勝</span></div><div className="raid-approved-detail__eligibility"><span>{eligibilityLabel}</span><div>{[1, 2, 3].map(step => <span className={completed >= step ? 'is-done' : ''} key={step}><RaidApprovedIcon name="medal" /></span>)}</div></div><p>参加時の共通進行　Lv.1</p></section>;
}

export function RaidApprovedChallenge({ children }: { children: ReactNode }) {
  return <div className="raid-approved-detail__challenge">{children}</div>;
}
