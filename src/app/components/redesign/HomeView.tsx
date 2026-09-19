'use client';
import React, { useEffect, useState } from 'react';
import type { MissionProjection } from '@/domain/redesign/missions';
import type { RedesignState } from '@/domain/redesign/types';
import { CHARACTER_MASTERS } from '@/domain/redesign/masters';
import { QUEST_AREAS, nextQuestStage } from '@/domain/redesign/quests';
import { raidTimeRemaining, raidRewardLabel } from '@/domain/redesign/raidPresentation';
import { supabase } from '@/utils/supabase';
import { describeHomeActivity } from '@/domain/presentation/homeInitialGuide';
import { game04WorldText } from '@/theme/world';
import { useGame } from '../../context/GameContext';
import { buildDirectMessageConversations } from '../../context/hooks/directMessageConversations';
import Modal from './Modal';

export type HomeSocialEvent = { id: string; room_id: string; author_id: string; kind: 'raid_rescue'; body: string; created_at: string };
export type HomeEncounter = { id: string; name: string; expiresAt: string };
export type HomeAction = (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
export const HOME_BACKGROUNDS = [{ id: 'bg_default', name: '夕桜の城門', image: '/bg/sengoku/castle-approach.jpg' }, { id: 'bg_kabukicho', name: '夕桜の城下町', image: '/bg/sengoku/castle-town.jpg' }];
type Activity = { id: string; activity_type?: string; actor_display_name?: string; display_payload?: { title?: string }; created_at?: string };
export default function HomeView({ state, onAction, onNavigate, encounterRaid, socialEvents = [], missions = [], previewOnly = false }: { state: RedesignState; onAction: HomeAction; onNavigate: (tab: string) => void; encounterRaid?: HomeEncounter | null; socialEvents?: HomeSocialEvent[]; missions?: MissionProjection[]; previewOnly?: boolean }) {
  const game = useGame();
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [missionBusy, setMissionBusy] = useState(false);
  const [missionError, setMissionError] = useState('');
  const [selector, setSelector] = useState<'character' | 'background' | null>(null);
  const [community, setCommunity] = useState<'activity' | 'global' | 'dm'>('activity');
  const [expanded, setExpanded] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [communityError, setCommunityError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [dmText, setDmText] = useState('');
  const [now, setNow] = useState(Date.now);
  const [banner, setBanner] = useState(0);
  const favorite = CHARACTER_MASTERS.find(c => c.id === state.homeCharacterId) ?? CHARACTER_MASTERS.find(c => c.id === state.deck[0]?.characterId) ?? CHARACTER_MASTERS[0];
  const background = HOME_BACKGROUNDS.find(b => b.id === state.homeBackgroundId) ?? HOME_BACKGROUNDS[0];
  const stage = nextQuestStage(state.clearedStages);
  const area = QUEST_AREAS.find(a => a.id === stage.areaId)!;
  const conversations = buildDirectMessageConversations(game.directMessages ?? [], game.session?.user?.id ?? '', game.dmUnreadConversations ?? []);
  const activeDm = conversations.find(c => c.userId === game.dmRecipientId);
  const direct = (game.directMessages ?? []).filter((m: {sender_id:string;recipient_id:string}) => game.dmRecipientId && (m.sender_id === game.dmRecipientId || m.recipient_id === game.dmRecipientId));
  useEffect(() => {
    if (previewOnly) return;
    let cancelled = false;
    void supabase.rpc('get_recent_social_activity_feed', { p_limit: 20 }).then(({ data, error }) => { if (!cancelled) { setActivities((data ?? []).filter((item: Activity) => !/PVP|GVG|GUILD/.test(item.activity_type ?? ''))); if (error) setCommunityError('活動の取得に失敗しました。'); } });
    return () => { cancelled = true; };
  }, [state.userId, previewOnly]);
  useEffect(() => { const timer = window.setInterval(() => { setNow(Date.now()); setBanner(i => (i + 1) % 2); }, 8000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { if (!previewOnly) game.setChatChannel(community === 'dm' ? 'DM' : 'GLOBAL'); }, [community, game.setChatChannel, previewOnly]);
  useEffect(() => { if (previewOnly) return; game.setShowTribeChatPanel(expanded && community !== 'activity'); return () => game.setShowTribeChatPanel(false); }, [expanded, community, game.setShowTribeChatPanel, previewOnly]);
  async function saveHome(payload: Record<string, unknown>) {
    setSaving(true); setSaveError('');
    try { await onAction('set_home', payload); setSelector(null); } catch (error) { setSaveError(error instanceof Error ? error.message : '変更を保存できませんでした'); } finally { setSaving(false); }
  }
  const tabs = <div className="rd-tabs">{([['activity','活動'],['global','全体'],['dm',`DM${game.dmUnreadTotal ? ` (${game.dmUnreadTotal})` : ''}`]] as const).map(([id,label]) => <button key={id} className={community === id ? 'active' : ''} onClick={() => setCommunity(id)}>{label}</button>)}</div>;
  function messages(full: boolean) {
    if (community !== 'dm') {
      const legacy: { id: string; createdAt: string; author: string; body: string; userId?: string }[] = community === 'activity'
        ? activities.map(a => ({ id: a.id, createdAt: a.created_at ?? '', author: a.actor_display_name || '戦国便り', body: game04WorldText(a.display_payload?.title || describeHomeActivity(a.activity_type)) }))
        : (game.guildChats ?? []).map((m: { id: string; created_at?: string; author_name?: string; content?: string; user_id?: string }) => ({ id: m.id, createdAt: m.created_at ?? '', author: m.author_name || 'プレイヤー', body: m.content ?? '', userId: m.user_id }));
      const merged = [...legacy.map(m => ({ ...m, roomId: '' })), ...socialEvents.map(e => ({ id: e.id, createdAt: e.created_at, author: '援軍要請', body: typeof e.body === 'string' ? e.body : 'レイドの援軍を求めています。', roomId: e.room_id, userId: e.author_id }))].sort((a,b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      return merged.length ? merged.slice(0, full ? merged.length : 3).map(m => <div className="rd-message" key={m.id}><button className="rd-text-button" onClick={() => { if (m.userId && m.userId !== state.userId) { game.setDmRecipientId(m.userId); setCommunity('dm'); setExpanded(true); } }}>{m.author}</button><div><span>{m.body}</span>{m.roomId && <button className="rd-button rd-rescue-link" onClick={() => { setExpanded(false); onNavigate(`raid:${m.roomId}`); }}>レイドを確認 ›</button>}</div></div>) : <p className="rd-muted">{community === 'activity' ? communityError || '新しい活動はまだありません' : '全体にひとこと送ってみましょう'}</p>;
    }
    if (full && game.dmRecipientId) return <><button className="rd-button" onClick={() => game.setDmRecipientId(null)}>会話一覧へ</button><h3>{activeDm?.userName || 'プレイヤー'}</h3>{direct.map((m: {id:string;sender_name?:string;message?:string;content?:string}) => <p className="rd-message" key={m.id}><b>{m.sender_name || 'プレイヤー'}</b><span>{m.message || m.content}</span></p>)}</>;
    return conversations.length ? conversations.slice(0, full ? conversations.length : 3).map(c => <button className="rd-message rd-conversation" key={c.userId} onClick={() => { game.setDmRecipientId(c.userId); setExpanded(true); }}><b>{c.userName}{c.unreadCount ? ` (${c.unreadCount})` : ''}</b><span>{c.latestMessage}</span></button>) : <p className="rd-muted">ダイレクトメッセージはまだありません。全体チャットの名前から会話を始められます。</p>;
  }
  return <>
    <section className="rd-home-visual" style={{ backgroundImage: `url(${background.image})` }} aria-label="お気に入り武将"><img className="rd-home-character" src={favorite.image} alt={favorite.name} /><div className="rd-home-switch"><button onClick={() => { setSaveError(''); setSelector('character'); }}>武将切替</button><button onClick={() => { setSaveError(''); setSelector('background'); }}>背景切替</button></div>{encounterRaid && Date.parse(encounterRaid.expiresAt) > now && <button className="rd-home-encounter" onClick={() => onNavigate('raid')}><small>エンカウントレイド発生中</small><strong>{encounterRaid.name}</strong><span>残り {raidTimeRemaining(encounterRaid.expiresAt, now)} ›</span></button>}<div className="rd-home-shortcuts"><button onClick={() => setMissionsOpen(true)}>任務</button><button onClick={() => onNavigate('shop')}>商店</button><button disabled title="今後公開予定">同盟</button></div><p className="rd-home-name">{favorite.name}</p></section>
    <div className="rd-home-bottom"><div className="rd-home-adventure"><button className="rd-quest-resume" onClick={() => onNavigate('quest:resume')}><small>クエスト · {area.name}</small><strong>{area.index}-{stage.index} {stage.name}</strong><span>続きから ›</span></button><button className="rd-quest-resume rd-territory-entry" onClick={() => onNavigate('territory')}><small>他領地の城を攻略</small><strong>領土侵攻</strong><span>侵攻先を選ぶ ›</span></button></div><section className="rd-community-preview">{tabs}<div className="rd-community-lines">{messages(false)}</div><button className="rd-text-button" onClick={() => setExpanded(true)}>コミュニティを開く ›</button></section><button className="rd-rotation-banner" onClick={() => onNavigate(banner ? 'shop' : 'gacha')}><span>{banner ? '旅の支度を整える' : '新たな力と出会う'}</span><strong>{banner ? '商店' : '登用'} ›</strong></button></div>
    {missionsOpen && <Modal title="攻略の記録" onClose={() => setMissionsOpen(false)}><p>クリア済み {state.clearedStages.length} / {QUEST_AREAS.reduce((sum, a) => sum + a.stages.length, 0)} ステージ</p><div className="rd-stack">{QUEST_AREAS.map(a => { const cleared = a.stages.filter(stage => state.clearedStages.includes(stage.id)).length; return <div className="rd-panel rd-row" key={a.id}><strong>{a.name}</strong><span>{cleared}/{a.stages.length}{cleared === a.stages.length ? ' 達成' : ''}</span></div>; })}</div>{missions.length ? <div className="rd-stack">{missions.map(mission => <section className="rd-panel" key={mission.id}><strong>{mission.name}</strong><p>{mission.description}</p><p>{mission.current} / {mission.target}</p><ul>{mission.rewards.map((reward, index) => <li key={index}>{raidRewardLabel(reward)}</li>)}</ul><button className="rd-button" disabled={missionBusy || previewOnly || mission.status !== 'claimable'} onClick={async () => { setMissionBusy(true); setMissionError(''); try { await onAction('claim_mission', { missionId: mission.id }); } catch (reason) { setMissionError(reason instanceof Error ? reason.message : '受け取れませんでした。'); } finally { setMissionBusy(false); } }}>{mission.status === 'claimed' ? '受取済み' : mission.status === 'claimable' ? '報酬を受け取る' : '攻略中'}</button></section>)}</div> : <p className="rd-muted">達成報酬は準備中です。</p>}{missionError && <p role="alert">{missionError}</p>}</Modal>}
    {selector && <Modal title={selector === 'character' ? 'ホーム武将切替' : '背景切替'} onClose={() => { if (!saving) setSelector(null); }}><div className="rd-grid">{selector === 'character' ? state.characters.map(owned => { const c = CHARACTER_MASTERS.find(m => m.id === owned.id); return c && <button key={c.id} disabled={saving} className="rd-choice" onClick={() => void saveHome({ characterId: c.id })}><img src={c.image} alt="" /><span>{c.name}</span></button>; }) : HOME_BACKGROUNDS.map(b => <button className="rd-choice" disabled={saving} key={b.id} onClick={() => void saveHome({ backgroundId: b.id })}><img src={b.image} alt="" /><span>{b.name}</span></button>)}</div>{saveError && <p role="alert">{saveError}</p>}</Modal>}
    {expanded && <Modal title="コミュニティ" onClose={() => setExpanded(false)} footer={community !== 'activity' && (community !== 'dm' || game.dmRecipientId) ? <form className="rd-row" onSubmit={async e => { e.preventDefault(); setCommunityError(''); try { if (community === 'dm') { if (await game.handleSendDirectMessage(game.dmRecipientId, dmText)) setDmText(''); } else await game.handleSendChat(); } catch { setCommunityError('送信できませんでした。もう一度お試しください。'); } }}><input aria-label="メッセージ" maxLength={500} value={community === 'dm' ? dmText : game.chatInput} onChange={e => community === 'dm' ? setDmText(e.target.value) : game.setChatInput(e.target.value)} /><button className="rd-button" disabled={game.chatSending || game.chatCooldown > 0 || !(community === 'dm' ? dmText : game.chatInput)?.trim()}>送信</button></form> : undefined}>{tabs}{messages(true)}{communityError && <p role="status">{communityError}</p>}</Modal>}
  </>;
}
