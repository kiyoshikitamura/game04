"use client";
import QuestRaidBonus from './QuestRaidBonus';

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { RaidParticipantDto, RaidRoomDto } from "@/domain/raidRoom";
import type { RaidRoomBriefing, RaidRoomResource } from "@/domain/raidRoomClient";
import type { RaidRoomDisplay } from "@/domain/raidRoomDisplay";
import { resolveRaidTopEnemy } from "@/domain/raidTopAssets";
import { getRaidRoomLifecyclePresentation } from "@/domain/raidRoomLifecyclePresentation";
import { CHARACTERS_MASTER, getCharacterTransparentImg } from "@/utils/game_constants";
import { preloadAssetManifest, type AssetResult } from "@/app/lib/screenAssets";
import OutlawButton from "../ui/OutlawButton";
import CanonicalDialog from "../ui/CanonicalDialog";
import "./RaidRoomDetail.css";
import { RaidApprovedChallenge, RaidApprovedContribution, RaidApprovedDetailVisual } from './RaidApprovedVisual';

export interface RaidRoomDetailProps {
  room: RaidRoomDto;
  briefing: RaidRoomResource<RaidRoomBriefing>;
  display: RaidRoomResource<RaidRoomDisplay>;
  participants: RaidRoomResource<readonly RaidParticipantDto[]>;
  currentUserId?: string;
  now: number | null;
  busy: boolean;
  onParticipants: () => void;
  onRewards: () => void;
  onEnemyInfo: () => void;
  action: ReactNode;
  rescue?: ReactNode;
}

const PERSON_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%23151d2a'/%3E%3Ccircle cx='64' cy='43' r='18' fill='%23697482'/%3E%3Cpath d='M24 118V98a40 40 0 0 1 80 0v20' fill='%23697482'/%3E%3C/svg%3E";
const BACKGROUND_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cpath fill='%23151d2a' d='M0 0h128v128H0z'/%3E%3C/svg%3E";
const ENTRANCES = [{ id: "enemy", label: "敵情報", icon: "/ui/raid/swords.svg" }, { id: "participants", label: "参加者", icon: "/ui/raid/people.svg" }, { id: "rewards", label: "報酬", icon: "/ui/raid/scroll.svg" }] as const;
const number = (value: number) => value.toLocaleString("ja-JP");
function Spinner() { return <div className="raid-detail__wait" role="status" aria-label="通信中"><span className="spinner" aria-hidden="true" /></div>; }
export default function RaidRoomDetail({ room, briefing, display, participants, currentUserId, now, busy, onParticipants, onRewards, onEnemyInfo, action, rescue }: RaidRoomDetailProps) {
  const [rescueOpen, setRescueOpen] = useState(false);
  const [compactHeader, setCompactHeader] = useState(false);
  const details = display.status === "success" && display.data?.roomId === room.roomId ? display.data : null;
  const brief = briefing.status === "success" && briefing.data?.roomId === room.roomId ? briefing.data : null;
  const enemy = brief?.raidVariantId ? resolveRaidTopEnemy(brief.raidVariantId) : null;
  const owner = room.owner.status === "available" ? room.owner.value : null;
  const role = details?.membership ?? (owner?.userId === currentUserId && currentUserId ? "owner" : brief?.membershipStatus === "joined" ? "joined_unknown" : brief?.membershipStatus === "not_joined" ? "not_joined" : "unknown");
  const isJoined = role === "owner" || role === "member" || role === "rescue" || role === "joined_unknown";
  const memberList = participants.status === "success" ? participants.data?.filter(entry => entry.roomId === room.roomId) ?? [] : [];
  const faces = memberList.slice(0, 5);
  const me = currentUserId ? memberList.find(entry => entry.player.userId === currentUserId) : undefined;
  const leaderUrl = (userId: string, priorUrl?: string | null) => {
    if (details && Object.prototype.hasOwnProperty.call(details.leaderCharacterIds, userId)) {
      const character = CHARACTERS_MASTER.find(entry => entry.id === details.leaderCharacterIds[userId]);
      return character ? getCharacterTransparentImg(character.name) : PERSON_FALLBACK;
    }
    return priorUrl || PERSON_FALLBACK;
  };
  const ownerUrl = owner ? leaderUrl(owner.userId, owner.leaderIconUrl.status === "available" ? owner.leaderIconUrl.value : null) : PERSON_FALLBACK;
  const faceImages = faces.map(entry => ({ id: entry.player.userId, name: entry.player.name, url: leaderUrl(entry.player.userId, entry.player.leaderIconUrl.status === "available" ? entry.player.leaderIconUrl.value : null) }));
  const manifest = [
    { src: ownerUrl, fallbackSrc: PERSON_FALLBACK, required: true },
    ...faceImages.map(entry => ({ src: entry.url, fallbackSrc: PERSON_FALLBACK, required: true })),
    ...ENTRANCES.map(entry => ({ src: entry.icon, fallbackSrc: BACKGROUND_FALLBACK, required: true })),
    ...(rescue ? [{ src: "/ui/raid/handshake.svg", fallbackSrc: BACKGROUND_FALLBACK, required: true }] : []),
    ...(enemy ? [{ src: enemy.backgroundUrl, fallbackSrc: BACKGROUND_FALLBACK, required: true }, { src: enemy.leaderImageUrl, fallbackSrc: PERSON_FALLBACK, required: true }] : []),
  ];
  const manifestKey = JSON.stringify(manifest);
  const [assets, setAssets] = useState<{ key: string; results: AssetResult[] } | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const scrollOwner = document.querySelector<HTMLElement>('.ui-hub-page-scroll');
    if (!scrollOwner) return;
    const update = () => setCompactHeader(scrollOwner.scrollTop > 180);
    update();
    scrollOwner.addEventListener('scroll', update, { passive: true });
    return () => scrollOwner.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    let cancelled = false;
    void preloadAssetManifest(JSON.parse(manifestKey)).then(results => { if (!cancelled) setAssets({ key: manifestKey, results }); });
    return () => { cancelled = true; };
  }, [manifestKey, retry]);
  const resolve = (url: string) => assets?.results.find(result => result.requestedSrc === url)?.resolvedSrc ?? PERSON_FALLBACK;
  if (assets?.key !== manifestKey || briefing.status === "loading" || display.status === "loading") return <Spinner />;
  if (assets.results.some(result => result.status === "failed")) return <div className="raid-detail__notice" role="alert"><p>画像を取得できませんでした。</p><OutlawButton loadingLabel="" onClick={() => { setAssets(null); setRetry(value => value + 1); }}>再試行</OutlawButton></div>;
  const lifecycle = getRaidRoomLifecyclePresentation(room, now);
  const hp = room.hp.status === "available" && room.hp.value.max > 0 ? room.hp.value : null;
  const percent = hp ? Math.max(0, Math.min(100, hp.current / hp.max * 100)) : null;
  const guild = details?.ownerGuild.status === "available" ? details.ownerGuild.value?.name ?? "Guild未所属" : "Guild未確認";
  const expires = room.expiresAt.status === "available" ? Date.parse(room.expiresAt.value) : NaN;
  const detailData = { areaLabel: enemy?.areaName ?? "エリア未確認", bossName: enemy?.bossName ?? brief?.bossName ?? "敵情報未確認", backgroundUrl: enemy?.backgroundUrl, characterUrl: enemy?.leaderImageUrl, ownerName: owner?.name ?? "未確認", ownerImageUrl: ownerUrl, guildLabel: guild, hpPercent: percent, hpValueLabel: hp ? `${number(hp.current)} / ${number(hp.max)}` : "HP未確認", remainingLabel: lifecycle.remainingLabel, expiryLabel: Number.isFinite(expires) ? `期限 ${new Date(expires).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })} JST` : "期限未確認", participantLabel: room.participantCount.status === "available" ? `${number(room.participantCount.value)}人` : "未確認", faces: faceImages };
  const detailActions = <>{ENTRANCES.map(entry => <OutlawButton key={entry.id} loadingLabel="" disabled={busy || (entry.id === "participants" && !isJoined)} aria-label={entry.label === "参加者" ? "参加者一覧" : entry.label} onClick={entry.id === "participants" ? onParticipants : entry.id === "rewards" ? onRewards : onEnemyInfo}><img src={resolve(entry.icon)} alt="" /><span>{entry.label}</span></OutlawButton>)}{rescue && <OutlawButton loadingLabel="" disabled={busy} aria-label="救援" onClick={() => setRescueOpen(true)}><img src={resolve("/ui/raid/handshake.svg")} alt="" /><span>救援</span></OutlawButton>}</>;
  const contribution = isJoined ? <RaidApprovedContribution damageLabel={participants.status === "error" ? "未確認" : "確認済み"} damageValue={me?.appliedDamage.status === "available" ? number(me.appliedDamage.value) : "未確認"} battlesLabel={me?.finalizedBattles.status === "available" ? `${number(me.finalizedBattles.value)}戦` : "未確認"} eligibilityLabel="討伐資格 3勝" completed={me?.finalizedBattles.status === "available" ? me.finalizedBattles.value : 0} /> : null;
  return <div className="raid-detail" data-testid="raid-room-detail"><RaidApprovedDetailVisual data={detailData} resolve={resolve} compact={compactHeader} actions={detailActions} contribution={contribution} challenge={<RaidApprovedChallenge>{action}</RaidApprovedChallenge>} /><QuestRaidBonus roomId={room.roomId} />{rescue && rescueOpen && createPortal(<CanonicalDialog title="救援" onClose={() => setRescueOpen(false)} actions={[{label:"閉じる",semantic:"secondary",onClick:()=>setRescueOpen(false)}]}>{rescue}</CanonicalDialog>, document.body)}</div>;
}
