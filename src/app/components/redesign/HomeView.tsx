'use client';
import { questDisplayName, raidRescueDisplayLabel } from '@/domain/redesign/contextNames';
import React, { useEffect, useRef, useState } from 'react';
import type { MissionProjection } from '@/domain/redesign/missions';
import type { RedesignState } from '@/domain/redesign/types';
import { CHARACTER_MASTERS, OWNABLE_SKILL_MASTERS, EQUIPMENT_MASTERS } from '@/domain/redesign/masters';
import { QUEST_AREAS, nextQuestStage } from '@/domain/redesign/quests';
import { raidTimeRemaining, raidRewardLabel } from '@/domain/redesign/raidPresentation';
import { supabase } from '@/utils/supabase';
import { describeHomeActivity } from '@/domain/presentation/homeInitialGuide';
import { game04WorldText } from '@/theme/world';
import { useGame } from '../../context/GameContext';
import { buildDirectMessageConversations } from '../../context/hooks/directMessageConversations';
import Modal from './Modal';
import HomeEffect from './HomeEffect';
import { useCharacterImageReadiness } from './CharacterImageReadiness';
import { characterArt, characterBackground } from '@/theme/creativeAssets';
import { HOME_BACKGROUNDS, isHomeBackgroundUnlocked, resolveHomeBackground } from '@/domain/redesign/home';
import './HomeView.css';
import { CommunityBadges, useCommunityProfiles } from './CommunityIdentity';
import { COMMUNITY_ACTIVITY_TYPES, COMMUNITY_MESSAGE_MAX_LENGTH, uniqueCommunityRows } from '@/domain/redesign/community';
export { HOME_BACKGROUNDS } from '@/domain/redesign/home';

// Match the existing community read refresh bound in useChat.ts. This is
// read-only recovery, not a timeout that unlocks unresolved mutations.
const HOME_ACTIVITY_READ_TIMEOUT_MS = 12_000;

export type HomeSocialEvent = { id: string; room_id: string; author_id: string; kind: 'raid_rescue'; body: string | {masterId?:string;level?:number}; created_at: string };
export type HomeEncounter = { id: string; name: string; expiresAt: string };
export type HomeAction = (action: string, payload?: Record<string, unknown>) => Promise<unknown>;

type Activity = { id: string; activity_type?: string; actor_display_name?: string; actor_user_id?: string; actor_favorite_character_id?: string; object_master_id?: string; display_payload?: { title?: string; item_name?: string; character_name?: string; skill_name?: string; equipment_name?: string }; created_at?: string };
export default function HomeView({ state, onAction, onNavigate, encounterRaid, socialEvents = [], missions = [], previewOnly = false }: { state: RedesignState; onAction: HomeAction; onNavigate: (tab: string) => void; encounterRaid?: HomeEncounter | null; socialEvents?: HomeSocialEvent[]; missions?: MissionProjection[]; previewOnly?: boolean }) {
  const game = useGame();
  const [selector, setSelector] = useState(false);
  const [draftCharacter, setDraftCharacter] = useState('');
  const [draftBackground, setDraftBackground] = useState('');
  const saveLock = useRef(false);
  const [community, setCommunity] = useState<'activity' | 'global' | 'dm'>('activity');
  const [expanded, setExpanded] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profileId, setProfileId] = useState('');
  const [communityError, setCommunityError] = useState('');
  const [activityError, setActivityError] = useState('');
  const [activityLoading, setActivityLoading] = useState(!previewOnly);
  const [activityAttempt, setActivityAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [dmText, setDmText] = useState('');
  const [now, setNow] = useState(Date.now);
  const [banner, setBanner] = useState(0);
  const favorite = CHARACTER_MASTERS.find(c => c.id === state.homeCharacterId) ?? CHARACTER_MASTERS.find(c => c.id === state.deck[0]?.characterId) ?? CHARACTER_MASTERS[0];
  const background = resolveHomeBackground(state.homeBackgroundId);
  const ownedCharacters = state.characters.map(owned => CHARACTER_MASTERS.find(c => c.id === owned.id)).filter((c): c is typeof CHARACTER_MASTERS[number] => !!c);
  const personImage = characterArt(favorite, 'full') ?? favorite.image;
  const homeImages = useHomeImages([background.image, personImage, characterArt(favorite, 'card') ?? personImage, '/ui/sengoku/09-chat.png', '/ui/sengoku/02-scroll-top.png', '/ui/sengoku/12-shop.png', '/ui/sengoku/04-fan-sakura.png', '/ui/sengoku/05-crossed-swords.png', '/ui/raid/v2/panel-sakura-overlay.png']);
  const dialogImages = useHomeImages(selector ? [...ownedCharacters.flatMap(c => [characterArt(c, 'card') ?? c.image, characterBackground(c) ?? background.image]), ...HOME_BACKGROUNDS.map(b => b.image)] : []);
  const encounterActive = !!encounterRaid && Date.parse(encounterRaid.expiresAt) > now;
  const claimableMissions = missions.filter(m => m.status === 'claimable').length;
  function openSelector() { setDraftCharacter(favorite.id); setDraftBackground(background.id); setSaveError(''); setSelector(true); }
  const stage = nextQuestStage(state.clearedStages);
  const area = QUEST_AREAS.find(a => a.id === stage.areaId)!;
  const conversations = buildDirectMessageConversations(game.directMessages ?? [], game.session?.user?.id ?? '', game.dmUnreadConversations ?? []);
  const activeDm = conversations.find(c => c.userId === game.dmRecipientId);
  const direct = (game.directMessages ?? []).filter((m: {sender_id:string;recipient_id:string}) => game.dmRecipientId && (m.sender_id === game.dmRecipientId || m.recipient_id === game.dmRecipientId));
  useEffect(() => {
    if (previewOnly) return;
    let cancelled = false;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      cancelled = true;
      controller.abort();
      setActivityError('活動を取得できませんでした。');
      setActivityLoading(false);
    }, HOME_ACTIVITY_READ_TIMEOUT_MS);
    setActivityLoading(true);
    setActivityError('');
    void (async () => {
      try {
        let response = await supabase.rpc('game04_get_community_activity', { p_limit: 20 }).abortSignal(controller.signal);
        if (response.error?.code === 'PGRST202') response = await supabase.rpc('get_recent_social_activity_feed', { p_limit: 20 }).abortSignal(controller.signal);
        const { data, error } = response;
        if (cancelled) return;
        if (error) throw error;
        const visible = uniqueCommunityRows((data ?? []).filter((item: Activity) => COMMUNITY_ACTIVITY_TYPES.has(item.activity_type ?? ''))) as Activity[];
        // Author decoration must not hold the already available activity feed.
        setActivities(visible);
      } catch {
        if (!cancelled) setActivityError('活動を取得できませんでした。');
      } finally {
        window.clearTimeout(timer);
        if (!cancelled) setActivityLoading(false);
      }
    })();
    return () => { cancelled = true; window.clearTimeout(timer); controller.abort(); };
  }, [state.userId, previewOnly, activityAttempt, expanded]);
  const profiles = useCommunityProfiles(state.userId, [state.userId, profileId, ...activities.map(a => a.actor_user_id ?? ''), ...socialEvents.map(e => e.author_id), ...(game.guildChats ?? []).map((m: { user_id?: string; author_id?: string }) => m.user_id || m.author_id || ''), ...(game.directMessages ?? []).flatMap((m: { sender_id: string; recipient_id: string }) => [m.sender_id, m.recipient_id]), ...conversations.map(c => c.userId)], !previewOnly, `${expanded}:${profileId}:${activityAttempt}:${game.session?.access_token}:${game.username}:${game.bio}`);
  const profileFaces: Record<string, string> = {};
  for (const profile of Object.values(profiles)) { const character = CHARACTER_MASTERS.find(c => c.id === profile.favorite_character_id); if (character) profileFaces[profile.user_id] = characterArt(character, 'portrait') ?? character.image; }
  const profileName = (id: string | undefined, fallback: string) => id === state.userId ? game.username || fallback : (id && profiles[id]?.username) || fallback;
  const badges = (id?: string) => <CommunityBadges authenticated={id ? profiles[id]?.authenticated : false} vipExpiresAt={id ? profiles[id]?.vip_expires_at : null} now={now} />;
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); const rotation = window.setInterval(() => setBanner(i => (i + 1) % 2), 8000); return () => { window.clearInterval(timer); window.clearInterval(rotation); }; }, []);
  useEffect(() => { if (!previewOnly) game.setChatChannel(community === 'dm' ? 'DM' : 'GLOBAL'); }, [community, game.setChatChannel, previewOnly]);
  useEffect(() => { if (previewOnly) return; game.setShowTribeChatPanel(expanded && community !== 'activity'); return () => game.setShowTribeChatPanel(false); }, [expanded, community, game.setShowTribeChatPanel, previewOnly]);
  async function saveHome() {
    if (saveLock.current || !dialogImages.ready) return;
    const choice = HOME_BACKGROUNDS.find(b => b.id === draftBackground);
    if (!choice || !isHomeBackgroundUnlocked(choice, state.clearedStages, state.unlockedHomeBackgroundIds) || !ownedCharacters.some(c => c.id === draftCharacter)) return;
    saveLock.current = true; setSaving(true); setSaveError('');
    try { await onAction('set_home', { characterId: draftCharacter, backgroundId: draftBackground }); setSelector(false); }
    catch (error) { setSaveError(error instanceof Error ? error.message : '変更を保存できませんでした'); }
    finally { saveLock.current = false; setSaving(false); }
  }
  const tabs = <div className="rd-tabs">{([['activity','活動'],['global','全体'],['dm',`DM${game.dmUnreadTotal ? ` (${game.dmUnreadTotal})` : ''}`]] as const).map(([id,label]) => <button key={id} className={community === id ? 'active' : ''} disabled={!homeImages.ready} onClick={() => setCommunity(id)}>{label}</button>)}</div>;
  const activityStatus = community === 'activity' ? <>{activityLoading && <div className="g4-home-spinner" role="status" aria-label="活動を読み込み中" />}{activityError && <div role="alert"><p>{activityError}</p><button type="button" className="rd-button" disabled={activityLoading} onClick={() => setActivityAttempt(value => value + 1)}>再読み込み</button></div>}</> : null;
  function messages(full: boolean) {
    if (community !== 'dm') {
      const legacy: { id: string; createdAt: string; author: string; body: string; userId?: string }[] = community === 'activity'
        ? activities.map(a => ({ id: a.id, createdAt: a.created_at ?? '', author: profileName(a.actor_user_id, a.actor_display_name || '戦国便り'), userId: a.actor_user_id, body: activityBody(a) }))
        : (game.guildChats ?? []).map((m: { id: string; created_at?: string; author_name?: string; content?: string; user_id?: string }) => ({ id: m.id, createdAt: m.created_at ?? '', author: profileName(m.user_id, m.author_name || 'プレイヤー'), body: m.content ?? '', userId: m.user_id }));
      const merged = uniqueCommunityRows([...legacy.map(m => ({ ...m, roomId: '' })), ...socialEvents.map(e => ({ id: e.id, createdAt: e.created_at, author: profileName(e.author_id, '援軍要請'), body: rescueActivityBody(e.body), roomId: e.room_id, userId: e.author_id }))]).sort((a,b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      return merged.length ? merged.slice(0, full ? merged.length : 3).map(m => <div className="rd-message" key={m.id}>{m.userId && profileFaces[m.userId] && <img className="g4-home-message-face" src={profileFaces[m.userId]} alt="" />}<button className="rd-text-button" disabled={!homeImages.ready} onClick={() => { if (m.userId) setProfileId(m.userId); }}>{m.author}{badges(m.userId)}</button><div>{m.roomId ? <button className="g4-home-rescue-body" disabled={!homeImages.ready} aria-label={`${m.body} 共闘を確認`} onClick={() => { setExpanded(false); onNavigate(`raid:${m.roomId}`); }}>{m.body}<span aria-hidden="true"> ›</span></button> : <span>{m.body}</span>}</div>{m.createdAt && <time className="g4-home-message-time" dateTime={m.createdAt}>{activityTime(m.createdAt, now)}</time>}{m.userId && m.userId !== state.userId && <button className="g4-home-message-open" disabled={!homeImages.ready} aria-label={`${m.author}にDM`} onClick={() => { game.setDmRecipientId(m.userId!); setCommunity('dm'); setExpanded(true); }}><img src="/ui/sengoku/09-chat.png" alt="" /></button>}</div>) : <p className="rd-muted">{community === 'activity' ? activityLoading || activityError ? '' : '新しい活動はまだありません' : '全体にひとこと送ってみましょう'}</p>;
    }
    if (full && game.dmRecipientId) return <><button className="rd-button" onClick={() => game.setDmRecipientId(null)}>会話一覧へ</button><h3>{profileName(game.dmRecipientId, activeDm?.userName || 'プレイヤー')}{badges(game.dmRecipientId)}</h3>{direct.map((m: {id:string;sender_id:string;sender_name?:string;message?:string;content?:string}) => <p className="rd-message" key={m.id}><button className="rd-text-button" onClick={() => setProfileId(m.sender_id)}>{profileName(m.sender_id, m.sender_name || 'プレイヤー')}{badges(m.sender_id)}</button><span>{m.message || m.content}</span></p>)}</>;
    return conversations.length ? conversations.slice(0, full ? conversations.length : 3).map(c => <button className="rd-message rd-conversation" disabled={!homeImages.ready} key={c.userId} onClick={() => { game.setDmRecipientId(c.userId); setExpanded(true); }}><b>{profileName(c.userId, c.userName)}{badges(c.userId)}{c.unreadCount ? ` (${c.unreadCount})` : ''}</b><span>{c.latestMessage}</span></button>) : <p className="rd-muted">ダイレクトメッセージはまだありません。全体チャットの名前から会話を始められます。</p>;
  }
  return <>
    <div className={`g4-home ${encounterActive ? 'has-encounter' : ''}`} style={{ backgroundImage: `url(${background.image})` }} aria-busy={!homeImages.ready}>
      <div className="g4-home-stage">
        <section className="g4-home-visual" aria-label="お気に入り武将">
          {homeImages.ready && <><HomeEffect backgroundImage={background.image} /><img className="g4-home-person" src={personImage} alt={favorite.name} /></>}
          {!homeImages.ready && <div className="g4-home-loading" role="status">{homeImages.error ? <><span>画像を読み込めませんでした</span><button className="rd-button" onClick={homeImages.retry}>再読み込み</button></> : <span className="g4-home-spinner" aria-label="読み込み中" />}</div>}
        </section>
        <nav className="g4-home-shortcuts" aria-label="本陣の操作">
          <button className="g4-home-switch" disabled={!homeImages.ready} onClick={openSelector}>切替</button>
          <button disabled={!homeImages.ready} onClick={() => game.setShowMissionPanel(true)}><img src="/ui/sengoku/02-scroll-top.png" alt="" /><span>任務</span>{claimableMissions > 0 && <i aria-label="未受取の任務報酬" />}</button>
          <button disabled={!homeImages.ready} onClick={() => onNavigate('shop')}><img src="/ui/sengoku/12-shop.png" alt="" /><span>商店</span></button>
          <button disabled aria-label="同盟・未解放" title="今後公開予定"><HomeLock /><span>同盟</span><small>未解放</small></button>
        </nav>
      </div>
      <div className="g4-home-bottom">
        {encounterActive && encounterRaid && <button className="g4-home-encounter g4-home-gold-frame" disabled={!homeImages.ready} onClick={() => onNavigate(`raid:${encounterRaid.id}`)}><img src="/ui/sengoku/05-crossed-swords.png" alt="" /><strong>共闘発生</strong><span className="g4-home-boss">{encounterRaid.name}</span><time>残り {raidTimeRemaining(encounterRaid.expiresAt, now)}</time><span className="g4-home-confirm">確認 ›</span></button>}
        <div className="g4-home-actions">
          <button className="g4-home-quest g4-home-gold-frame" disabled={!homeImages.ready} title={`${area.name} ${area.index}-${stage.index} ${questDisplayName(stage)}`} onClick={() => onNavigate('quest:resume')}><img src="/ui/sengoku/04-fan-sakura.png" alt="" /><strong>出陣の続き</strong></button>
          <button className="g4-home-territory g4-home-gold-frame" disabled={!homeImages.ready} onClick={() => onNavigate('territory')}><img src="/ui/sengoku/05-crossed-swords.png" alt="" /><strong>領土侵攻</strong></button>
        </div>
        <section className="g4-home-community" aria-label="交流">{tabs}<div className="g4-home-community-lines">{activityStatus}{messages(false)}</div><button className="g4-home-community-open" disabled={!homeImages.ready} onClick={() => setExpanded(true)}>交流を開く ›</button></section>
        <button className="g4-home-banner g4-home-gold-frame" disabled={!homeImages.ready} onClick={() => onNavigate(banner ? 'shop' : 'gacha')}><img className="g4-home-banner-person" src={characterArt(favorite, 'card') ?? personImage} alt="" /><strong>{banner ? '商店' : '召喚'}</strong><span>›</span></button>
      </div>
    </div>
    {selector && <Modal closeDisabled={saving} title="切替" className="g4-home-selector" onClose={() => { if (!saveLock.current) setSelector(false); }} footer={<div className="g4-home-selector-actions"><button className="rd-button" disabled={saving} onClick={() => setSelector(false)}>閉じる</button><button className="rd-button rd-primary" disabled={saving || !dialogImages.ready || !ownedCharacters.some(c => c.id === draftCharacter)} onClick={() => void saveHome()}>{saving ? '保存中…' : '保存'}</button></div>}>
      {!dialogImages.ready ? <div className="g4-home-loading" role="status">{dialogImages.error ? <><p>画像を読み込めませんでした</p><button className="rd-button" onClick={dialogImages.retry}>再読み込み</button></> : <span className="g4-home-spinner" aria-label="読み込み中" />}</div> : <>
        <h3>武将</h3><div className="g4-home-character-choices">{ownedCharacters.map(c => <button key={c.id} disabled={saving} aria-pressed={draftCharacter === c.id} className="g4-home-choice" onClick={() => setDraftCharacter(c.id)}><span className="g4-home-choice-art" style={{ backgroundImage: `url(${characterBackground(c) ?? background.image})` }}><img src={characterArt(c, 'card') ?? c.image} alt="" /></span><strong>{c.name}</strong><small>{draftCharacter === c.id ? '選択中' : '\u00a0'}</small></button>)}</div>
        <h3>背景</h3><div className="g4-home-background-choices">{HOME_BACKGROUNDS.map(b => { const unlocked = isHomeBackgroundUnlocked(b, state.clearedStages, state.unlockedHomeBackgroundIds); return <button key={b.id} disabled={saving || !unlocked} aria-pressed={draftBackground === b.id} className={`g4-home-choice ${unlocked ? '' : 'is-locked'}`} onClick={() => setDraftBackground(b.id)}><span className="g4-home-background-art"><img src={b.image} alt="" /></span><strong>{b.name}</strong><small>{unlocked ? draftBackground === b.id ? '選択中' : '\u00a0' : b.conditionLabel}</small></button>; })}</div>
      </>}{saveError && <p className="g4-home-error" role="alert">{saveError}</p>}
    </Modal>}
    {profileId && <Modal title="プロフィール" onClose={() => setProfileId('')} footer={profileId !== state.userId ? <button className="rd-button" onClick={() => { game.setDmRecipientId(profileId); setProfileId(''); setCommunity('dm'); setExpanded(true); }}>DMを送る</button> : undefined}>
      {profiles[profileId] ? <><h3>{profileName(profileId, 'プレイヤー')}{badges(profileId)}</h3><p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{profileId === state.userId ? game.bio || '自己紹介は未設定です。' : profiles[profileId].bio || '自己紹介は未設定です。'}</p></> : <><p>プロフィールを取得できない場合は再読み込みしてください。</p><button className="rd-button" onClick={() => setActivityAttempt(n => n + 1)}>再読み込み</button></>}
    </Modal>}
    {expanded && !profileId && <Modal title="コミュニティ" onClose={() => setExpanded(false)} footer={community !== 'activity' && (community !== 'dm' || game.dmRecipientId) ? <form className="rd-row" onSubmit={async e => { e.preventDefault(); setCommunityError(''); try { if (community === 'dm') { if (await game.handleSendDirectMessage(game.dmRecipientId, dmText)) setDmText(''); } else await game.handleSendChat(); } catch { setCommunityError('送信できませんでした。もう一度お試しください。'); } }}><input aria-label="メッセージ" maxLength={COMMUNITY_MESSAGE_MAX_LENGTH} value={community === 'dm' ? dmText : game.chatInput} onChange={e => community === 'dm' ? setDmText(e.target.value) : game.setChatInput(e.target.value)} /><button className="rd-button" disabled={game.chatSending || (community === 'global' && game.chatCooldown > 0) || !(community === 'dm' ? dmText : game.chatInput)?.trim()}>送信</button></form> : undefined}>{tabs}{activityStatus}{messages(true)}{communityError && <p role="status">{communityError}</p>}</Modal>}
  </>;
}

/** Keep the presentation hidden and controls disabled until its actual images decode. */
function useHomeImages(urls: string[]) {
  const images = useCharacterImageReadiness(urls, 'home');
  return { ready: images.ready, error: images.failed, retry: images.retry };
}

function HomeLock() {
  return <svg className="g4-home-lock" width="28" height="30" viewBox="0 0 24 28" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="3" d="M6 12V8a6 6 0 0 1 12 0v4"/><rect x="3" y="11" width="18" height="15" rx="2" fill="currentColor"/><path stroke="#211e22" strokeWidth="2" d="M12 18v4"/><circle cx="12" cy="17" r="2" fill="#211e22"/></svg>;
}
function activityTime(value: string, now: number) {
  const minutes = Math.max(0, Math.floor((now - Date.parse(value)) / 60000));
  if (!Number.isFinite(minutes)) return '';
  return minutes < 1 ? 'たった今' : minutes < 60 ? `${minutes}分前` : minutes < 1440 ? `${Math.floor(minutes / 60)}時間前` : `${Math.floor(minutes / 1440)}日前`;
}

/** System generated activity text only; player chat/DM content stays unchanged. */
function homeSystemText(value: string) { return game04WorldText(value).replaceAll('レイド', '共闘').replaceAll('クエスト', '出陣').replaceAll('ガチャ', '召喚'); }

function activityBody(activity: Activity) {
  const type = activity.activity_type ?? '';
  if(activity.display_payload?.title)return homeSystemText(activity.display_payload.title);
  if (type.startsWith('SSR_')) {
    const masters = type === 'SSR_CHARACTER' ? CHARACTER_MASTERS : type === 'SSR_SKILL' ? OWNABLE_SKILL_MASTERS : EQUIPMENT_MASTERS;
    const name = masters.find(item => item.id === activity.object_master_id)?.name || activity.display_payload?.item_name || activity.display_payload?.character_name || activity.display_payload?.skill_name || activity.display_payload?.equipment_name;
    if (name) return `SSR「${name}」を獲得`;
  }
  return homeSystemText(activity.display_payload?.title || describeHomeActivity(type));
}

function rescueActivityBody(body: HomeSocialEvent['body']) {
 if(typeof body==='string')return homeSystemText(body);
 const label=body?.masterId?raidRescueDisplayLabel(body.masterId,body.level??1):null;
 if(label)return `${label} の援軍を求めています。`;
 return '共闘の援軍を求めています。';
}
