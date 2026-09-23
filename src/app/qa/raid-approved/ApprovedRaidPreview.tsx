'use client';

import { useState } from 'react';
import { RAID_TOP_ENEMIES } from '@/domain/raidTopAssets';
import './ApprovedRaidPreview.css';

type IconName = 'clock' | 'people' | 'swords' | 'scroll' | 'handshake' | 'chest' | 'armor' | 'victory' | 'medal';
const icon = (name: IconName, label = '') => <img className="raid-approved__icon" src={`/ui/raid/${name}.svg`} alt={label} />;

function ResourceHeader() {
  return <>
    <header className="raid-approved__header">
      <div className="raid-approved__user"><img src="/characters/sakura_transparent_asset.png" alt="" /><div><strong>確認用の城主</strong><span>Lv.1　◇ 同盟 —</span></div></div>
      <button className="raid-approved__menu" type="button">MENU　≡</button>
    </header>
    <div className="raid-approved__resources"><span>{icon('chest')}30,000</span><span>{icon('medal')}1,000</span><span>{icon('clock')}50/50</span></div>
  </>;
}

function Footer() {
  return <nav className="raid-approved__footer" aria-label="メインナビゲーション">{[
    ['08-castle', 'ホーム'], ['04-fan-sakura', 'クエスト'], ['10-helmet', 'キャラ'], ['06-oni-mask', 'レイド'], ['11-ticket', 'ガチャ'],
  ].map(([asset, label]) => <button className={label === 'レイド' ? 'is-active' : ''} key={label} type="button"><img src={`/ui/sengoku/${asset}.png`} alt="" /><span>{label}</span></button>)}</nav>;
}

function Hero({ enemy, compact = false }: { enemy: typeof RAID_TOP_ENEMIES[number]; compact?: boolean }) {
  return <div className={`raid-approved__hero ${compact ? 'is-compact' : ''}`}>
    <img className="raid-approved__hero-bg" src={enemy.backgroundUrl} alt="" />
    <img className="raid-approved__hero-character" src={enemy.leaderImageUrl} alt="" />
    <div className="raid-approved__hero-shade" />
    <div className="raid-approved__boss-title"><h2>{enemy.bossName} <small>Lv.1</small></h2><span>{icon('medal')} 闇属性</span></div>
  </div>;
}

function Owner({ name = 'あかね' }: { name?: string }) { return <div className="raid-approved__owner"><img src="/characters/sakura_transparent_asset.png" alt="" /><strong>開催者　{name}</strong></div>; }
function Hp({ detail = false }: { detail?: boolean }) { return <div className="raid-approved__hp"><div className="raid-approved__hp-bar"><span /></div><div className="raid-approved__hp-text">{detail ? 'HP　200,000 / 200,000　(100%)' : 'HP 100%'}</div></div>; }
function Meta() { return <div className="raid-approved__meta"><span>{icon('clock')}2日23時間</span><span>{icon('people')}1/20人</span></div>; }

function ActionTile({ iconName, label }: { iconName: IconName; label: string }) { return <button className="raid-approved__tile" type="button">{icon(iconName)}<span>{label}</span></button>; }

function ListCard({ enemy, encounter = false }: { enemy: typeof RAID_TOP_ENEMIES[number]; encounter?: boolean }) {
  return <article className="raid-approved__list-card"><div className="raid-approved__list-art"><img src={enemy.backgroundUrl} alt="" /><img src={enemy.leaderImageUrl} alt="" /></div><div className="raid-approved__list-copy"><div className="raid-approved__badges"><span>{encounter ? 'エンカウント' : '領土侵攻'}</span><span>参加中</span></div><h3>{enemy.bossName} <small>Lv.1</small></h3><p className="raid-approved__attribute">{icon('medal')} {encounter ? '火属性・強敵' : '闇属性・高難度'}</p><Owner name={encounter ? 'さくら' : 'あかね'} /><Hp /></div><div className="raid-approved__card-bottom"><Meta /><button type="button">続きへ ›</button></div></article>;
}

function Listing() {
  const [tab, setTab] = useState('すべて');
  const [first, second] = RAID_TOP_ENEMIES;
  return <section className="raid-approved__screen"><div className="raid-approved__screen-head"><h1>レイド</h1><button type="button">更新</button></div><div className="raid-approved__tabs">{['すべて', 'エンカウント', '領土侵攻'].map(value => <button key={value} className={tab === value ? 'is-active' : ''} onClick={() => setTab(value)} type="button">{value}</button>)}</div><p className="raid-approved__sort">残り時間が短い順</p><div className="raid-approved__list"><ListCard enemy={first} encounter={tab !== '領土侵攻'} /><ListCard enemy={second} /></div><button className="raid-approved__ended" type="button">{icon('chest')}終了したレイド・未受取報酬 <b>›</b></button></section>;
}

function Detail({ lower = false }: { lower?: boolean }) {
  const enemy = RAID_TOP_ENEMIES[1];
  return <section className="raid-approved__screen raid-approved__detail-screen"><button className="raid-approved__back" type="button">‹ レイド一覧</button><Hero enemy={enemy} compact={lower} /><Owner /><Hp detail /><Meta />{!lower && <div className="raid-approved__tiles"><ActionTile iconName="swords" label="敵情報" /><ActionTile iconName="people" label="参加者" /><ActionTile iconName="scroll" label="報酬" /><ActionTile iconName="handshake" label="救援" /></div>}<div className="raid-approved__contribution"><h2>自分の貢献</h2><div className="raid-approved__damage">{icon('swords')}<span>累計ダメージ<strong>0</strong></span><button type="button">未挑戦</button></div><div className="raid-approved__stats"><span>{icon('armor')}挑戦　0戦</span><span>{icon('victory')}勝利　0勝</span></div><div className="raid-approved__eligibility"><span>討伐報酬資格まで<br /><b>あと3勝</b></span><div>{[1, 2, 3].map(i => <span key={i}>{icon('medal')}</span>)}</div></div><p>参加時の共通進行　Lv.1</p></div><button className="raid-approved__challenge" type="button">{icon('swords')}<strong>挑む</strong><span>{icon('clock')}消費行動力 5</span></button></section>;
}

export default function ApprovedRaidPreview() {
  const screens = ['listing', 'detail', 'lower'] as const;
  return <main className="raid-approved"><div className="raid-approved__board"><div className="raid-approved__panels">{screens.map((kind, index) => <div className="raid-approved__panel" key={kind}><h2 className="raid-approved__panel-title">{index === 0 && kind === 'listing' ? '01　レイド一覧' : kind === 'detail' ? '02　レイド詳細' : '03　詳細・下部'}</h2><ResourceHeader />{kind === 'listing' ? <Listing /> : <Detail lower={kind === 'lower'} />}<Footer /></div>)}</div></div></main>;
}
