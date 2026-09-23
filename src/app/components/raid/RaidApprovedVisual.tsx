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
  levelLabel: string;
}

export function RaidApprovedCard({ data, resolve = value => value, action }: { data: RaidApprovedCardData; resolve?: (url: string) => string; action: ReactNode }) {
  return <article className="raid-approved-card">
    <div className="raid-approved-card__art">{data.backgroundUrl && <img className="raid-approved-card__background" src={resolve(data.backgroundUrl)} alt="" />}{data.characterUrl && <img className="raid-approved-card__character" src={resolve(data.characterUrl)} alt="" />}</div>
    <div className="raid-approved-card__copy">
      <div className="raid-approved-card__badges"><span>{data.badgeLabel}</span>{data.statusLabel && <span>{data.statusLabel}</span>}</div>
      <h3>{data.bossName} <small>{data.levelLabel}</small></h3>
      <p className="raid-approved-card__attribute">{data.attributeIconUrl ? <img src={resolve(data.attributeIconUrl)} alt={`${data.attributeLabel}属性`} /> : `${data.attributeLabel}属性`}</p>
      <div className="raid-approved-card__owner"><span>{data.ownerImageUrl && <img src={resolve(data.ownerImageUrl)} alt="" />}</span><strong>開催者　{data.ownerName}</strong></div>
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
  levelLabel: string;
  attributeLabel: string;
  capacityLabel: string;
  attributeIconUrl?: string;
}

export function RaidApprovedDetailVisual({ data, resolve = value => value, compact = false, actions, contribution, challenge }: { data: RaidApprovedDetailData; resolve?: (url: string) => string; compact?: boolean; actions: ReactNode; contribution: ReactNode; challenge: ReactNode }) {
  const owner = <div className="raid-approved-detail__owner"><span>{data.ownerImageUrl && <img src={resolve(data.ownerImageUrl)} alt="" />}</span><strong>開催者　{data.ownerName}</strong></div>;
  const hp = <div className="raid-approved-detail__hp"><div role="meter" aria-label="共通HP" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.hpPercent ?? undefined}><span style={{width:`${data.hpPercent??0}%`}}/></div><strong>{data.hpValueLabel}</strong></div>;
  const facts = <div className="raid-approved-detail__facts"><span><RaidApprovedIcon name="clock"/>{data.remainingLabel}</span><span><RaidApprovedIcon name="people"/>{data.participantLabel}</span></div>;
  const name = <h2>{data.bossName} <small>{data.levelLabel}</small></h2>;
  const attribute = <span className="raid-approved-detail__attribute">{data.attributeIconUrl ? <img src={resolve(data.attributeIconUrl)} alt={`${data.attributeLabel}属性`}/> : `${data.attributeLabel}属性`}</span>;
  return <div className="raid-approved-detail">
    {compact ? <section className="raid-approved-detail__compact"><div className="raid-approved-detail__compact-art">{data.characterUrl&&<img src={resolve(data.characterUrl)} alt=""/>}</div><div className="raid-approved-detail__compact-copy"><div className="raid-approved-detail__title">{name}{attribute}</div>{owner}{hp}{facts}</div></section> : <><section className="raid-approved-detail__hero">{data.backgroundUrl&&<img className="raid-approved-detail__background" src={resolve(data.backgroundUrl)} alt=""/>}{data.characterUrl&&<img className="raid-approved-detail__character" src={resolve(data.characterUrl)} alt=""/>}<div className="raid-approved-detail__hero-copy"><span className="raid-approved-detail__badge">{data.areaLabel}</span><div className="raid-approved-detail__title">{name}{attribute}</div></div></section>{owner}<section className="raid-approved-detail__battle">{hp}{facts}</section></>}
    <nav className="raid-approved-detail__actions" aria-label="レイド操作">{actions}</nav>
    {contribution}
    {challenge}
  </div>;
}

export function RaidApprovedContribution({ damageLabel, damageValue, battlesLabel, victoryLabel, recentLabel, eligibilityLabel, progressLabel, completed = 0 }: { damageLabel: string; damageValue: string; battlesLabel: string; victoryLabel: string; recentLabel: string; eligibilityLabel: string; progressLabel: string; completed?: number }) {
  return <section className="raid-approved-detail__contribution"><h2>自分の貢献</h2><div className="raid-approved-detail__damage"><RaidApprovedIcon name="swords" /><span>累計ダメージ<strong>{damageValue}</strong></span><b aria-label={`直近 ${recentLabel}`}>{damageLabel}</b></div><div className="raid-approved-detail__stats"><span><RaidApprovedIcon name="armor" />挑戦　{battlesLabel}</span><span><RaidApprovedIcon name="victory" />勝利　{victoryLabel}</span></div><div className="raid-approved-detail__eligibility"><span>{eligibilityLabel}</span><div>{[1, 2, 3].map(step => <span className={completed >= step ? 'is-done' : ''} key={step}><RaidApprovedIcon name="medal" /></span>)}</div></div><p>{progressLabel}</p></section>;
}

export function RaidApprovedChallenge({ children }: { children: ReactNode }) {
  return <div className="raid-approved-detail__challenge">{children}</div>;
}
