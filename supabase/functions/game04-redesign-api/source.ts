// Bundled with the shared pure gameplay modules before Edge deployment.
import { BATTLE_RULES, buildBattleParty, buildInitialState, importLegacyAssets, grantReward, CHARACTER_MASTERS, type LegacyAssets } from '../../../src/domain/redesign/masters.ts';
import { applyAcquisitionEvents, type AcquisitionEvent, type AcquisitionMaster } from '../../../src/domain/redesign/acquisitions.ts';
import { applyGrowthAction, validateDeck } from '../../../src/domain/redesign/growth.ts';
import { evaluateMissions, getClaimableMission, type MissionConfig } from '../../../src/domain/redesign/missions.ts';
import { simulateBattle } from '../../../src/domain/redesign/battle.ts';
import { getQuestStage, isQuestStageUnlocked } from '../../../src/domain/redesign/quests.ts';
import { applyRaidAction, createRaidRoom, getRaidMaster, raidEnemy } from '../../../src/domain/redesign/raid.ts';
import type { BattleInput, RaidRoom, RedesignState, Reward } from '../../../src/domain/redesign/types.ts';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const url = Deno.env.get('SUPABASE_URL')!;
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const EXPECTED_PROJECT = 'lrgyllgzcdcphlbmkknc';
class ApiError extends Error { constructor(message: string, public status = 400) { super(message); } }
async function db(path: string, body?: unknown): Promise<any> {
  const response = await fetch(`${url}/rest/v1/${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const result = await response.json();
  if (!response.ok) throw new ApiError(result.message || 'データを保存できませんでした。', result.code === '40001' ? 409 : 400);
  return result;
}
const rpc = (name: string, body: unknown) => db(`rpc/${name}`, body);
async function uuidFor(value: string) {
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  hash[6] = (hash[6] & 15) | 64; hash[8] = (hash[8] & 63) | 128;
  const h = [...hash.slice(0, 16)].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
async function acquisitionInput(userId: string): Promise<{legacy: LegacyAssets; events: AcquisitionEvent[]; master: AcquisitionMaster}> {
  return rpc('game04_acquisition_input', { p_user_id: userId });
}
async function stateFor(userId: string): Promise<RedesignState> {
  const input = await acquisitionInput(userId);
  for (let attempt = 0; attempt < 4; attempt++) {
    const state: RedesignState = await rpc('game04_get_state', { p_user_id: userId, p_initial: buildInitialState(userId, input.legacy) });
    const migrated = importLegacyAssets(state, input.legacy);
    const imported = applyAcquisitionEvents(migrated, input.events, input.master);
    if (JSON.stringify(imported) === JSON.stringify(state)) return state;
    try { return (await commit(state, imported, crypto.randomUUID())).state; }
    catch (error) { if (!(error instanceof ApiError) || error.status !== 409 || attempt === 3) throw error; }
  }
  throw new ApiError('データ更新中です。もう一度お試しください。', 409);
}
async function commit(before: RedesignState, after: RedesignState, requestId: string, battle: unknown = null, room: (RaidRoom & {version?: number}) | null = null, roomVersion: number | null = null) {
  return rpc('game04_commit_state', { p_user_id: before.userId, p_expected_version: before.version, p_state: after,
    p_cash_delta: after.cash - before.cash, p_energy_delta: after.energy - before.energy, p_request_id: requestId,
    p_battle: battle, p_raid: room, p_raid_expected_version: roomVersion });
}
async function roomFor(id: string): Promise<RaidRoom & {version: number}> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError('レイドが不正です。');
  const [row] = await db(`game04_raid_rooms?id=eq.${id}&select=state,version`);
  if (!row) throw new ApiError('レイドが見つかりません。', 404);
  return { ...row.state, version: row.version };
}
async function roomsFor(userId: string) {
  const rows = await db('game04_raid_rooms?select=state,version&order=created_at.desc&limit=200');
  return rows.map((row: any) => ({ ...row.state, version: row.version,
    status: row.state.status === 'active' && Date.parse(row.state.expiresAt) <= Date.now() ? 'expired' : row.state.status,
  })).filter((room: RaidRoom) => room.status === 'active' || room.participants.some(p => p.userId === userId));
}
async function rewardPolicy(): Promise<AcquisitionMaster> {
  const [row] = await db('game04_redesign_master?key=eq.acquisition_conversion&select=data');
  if (!row?.data) throw new ApiError('獲得設定を確認できません。', 503);
  return row.data;
}
async function missionConfig(): Promise<MissionConfig> {
  const [row] = await db('game04_redesign_master?key=eq.missions&select=data');
  return row?.data ?? { enabled: false, missions: [] };
}
async function responseFor(userId: string, extra: Record<string, unknown> = {}) {
  const [state, rooms, socialEvents, pending] = await Promise.all([stateFor(userId), roomsFor(userId),
    db('game04_social_events?select=*&order=created_at.desc&limit=30'),
    db(`game04_battles?user_id=eq.${userId}&status=eq.started&select=id,kind,target_id&order=created_at.asc&limit=1`),
  ]);
  return { state, rooms, socialEvents, missions: evaluateMissions(state, await missionConfig()), pendingBattle: pending[0] ?? null, ...extra };
}
async function runBattle(userId: string, name: string, payload: any, id: string, playerName: string) {
  let [record] = await db(`game04_battles?id=eq.${id}&user_id=eq.${userId}&select=*`);
  if (record?.status === 'settled') return responseFor(userId, record.result);
  if (!record) {
    const outstanding = await db(`game04_battles?user_id=eq.${userId}&status=eq.started&select=id&limit=1`);
    if (outstanding.length) throw new ApiError('未完了の戦闘を再開してください。', 409);
    const state = await stateFor(userId); validateDeck(state, state.deck);
    const kind = name === 'quest_battle' ? 'quest' : 'raid';
    let waves: BattleInput['waves'], cost: number, targetId: string, raidLevel: number | undefined;
    let startRoom: (RaidRoom & {version: number}) | null = null;
    if (kind === 'quest') {
      const stage = getQuestStage(String(payload.stageId));
      if (!stage || !isQuestStageUnlocked(stage.id, state.clearedStages)) throw new ApiError('このステージは未解放です。');
      waves = stage.waves; cost = stage.energyCost; targetId = stage.id;
    } else {
      const room = await roomFor(String(payload.roomId)), master = getRaidMaster(room.masterId);
      const me = room.participants.find(p => p.userId === userId);
      if (room.status !== 'active' || Date.parse(room.expiresAt) <= Date.now() || !me || me.leftAt) throw new ApiError('参加できる開催中レイドを選んでください。');
      startRoom = room;
      waves = [[raidEnemy(master, room.level)]]; cost = master.energyCost; targetId = room.id; raidLevel = room.level;
    }
    if (state.energy < cost) throw new ApiError('行動力が足りません。');
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    const input = { seed, party: buildBattleParty(state), waves, rules: BATTLE_RULES, raidLevel };
    await commit(state, { ...state, energy: state.energy - cost }, id, { id, kind, targetId, seed, input, status: 'started' }, startRoom, startRoom?.version ?? null);
    record = { id, kind, target_id: targetId, input, seed, status: 'started' };
  }
  const battle = simulateBattle(record.input);
  const settlementId = await uuidFor(`settlement:${id}`);
  for (let attempt = 0; attempt < 4; attempt++) {
    const state = await stateFor(userId); let after = structuredClone(state);
    let room: (RaidRoom & {version?: number}) | null = null, version: number | null = null;
    const rewards: Reward[] = []; let firstClear = false, encounterRaidId: string | null = null;
    if (record.kind === 'quest' && battle.outcome === 'win') {
      const stage = getQuestStage(record.target_id)!;
      firstClear = !state.clearedStages.includes(stage.id);
      let rng = record.seed >>> 0;
      const random = () => { rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0; return rng / 4294967296; };
      const luck = record.input.party.reduce((n: number, p: any) => n + p.stats.luk, 0) / 5;
      rewards.push(...stage.rewards, ...(firstClear ? stage.firstRewards : []), ...stage.rareRewards.filter(r => random() < Math.min(1, (r.chance ?? 0) * (1 + luck / 1000))));
      const policy = await rewardPolicy();
      for (let i = 0; i < rewards.length; i++) after = grantReward(after, rewards[i], await uuidFor(`reward:${id}:${i}`), policy);
      if (firstClear) after.clearedStages.push(stage.id);
      if (random() < stage.encounterChance) {
        encounterRaidId = await uuidFor(`encounter:${id}`);
        room = createRaidRoom('encounter_flame', userId, encounterRaidId, Date.now()); room.participants[0].name = playerName; version = -1;
      }
    } else if (record.kind === 'raid') {
      const currentRoom = await roomFor(record.target_id); version = currentRoom.version;
      const transition = applyRaidAction(currentRoom, after, 'raid_battle', { battleId: id, battleLevel: record.input.raidLevel, result: battle, energyAlreadyPaid: true });
      room = transition.room; after = transition.state;
    }
    const result = { battle, rewards, firstClear, encounterRaidId };
    try {
      await commit(state, after, settlementId, { id, status: 'settled', result }, room, version);
      return responseFor(userId, result);
    } catch (error) {
      const [saved] = await db(`game04_battles?id=eq.${id}&user_id=eq.${userId}&select=status,result`);
      if (saved?.status === 'settled') return responseFor(userId, saved.result);
      if (!(error instanceof ApiError) || error.status !== 409 || attempt === 3) throw error;
    }
  }
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  try {
    if (new URL(url).hostname !== `${EXPECTED_PROJECT}.supabase.co`) throw new ApiError('開発環境の接続設定を確認してください。', 503);
    if (request.method !== 'POST') throw new ApiError('Method not allowed', 405);
    const authorization = request.headers.get('authorization') || '';
    if (!/^Bearer \S+$/.test(authorization)) throw new ApiError('ログインしてください。', 401);
    const auth = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: authorization } });
    const user = await auth.json();
    if (!auth.ok || !user.id) throw new ApiError('ログインし直してください。', 401);
    const [profile] = await db(`users?id=eq.${user.id}&select=id,username`);
    if (!profile) throw new ApiError('先にプレイヤー名を登録してください。', 409);
    const { action, payload = {}, requestId } = await request.json();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) throw new ApiError('操作IDが不正です。');
    if (action === 'get_state' || action === 'raid_refresh') return new Response(JSON.stringify(await responseFor(user.id)), { headers });
    if (action === 'quest_battle' || action === 'raid_battle') return new Response(JSON.stringify(await runBattle(user.id, action, payload, requestId, profile.username)), { headers });
    const [prior] = await db(`game04_requests?user_id=eq.${user.id}&request_id=eq.${requestId}&select=request_id`);
    if (prior) return new Response(JSON.stringify(await responseFor(user.id)), { headers });
    const state = await stateFor(user.id); let after: RedesignState, room: RaidRoom | null = null, version: number | null = null;
    if (action === 'claim_mission') {
      const mission = getClaimableMission(state, await missionConfig(), String(payload.missionId));
      after = structuredClone(state);
      const policy = await rewardPolicy();
      for (let i = 0; i < mission.rewards.length; i++) after = grantReward(after, mission.rewards[i], await uuidFor(`mission:${user.id}:${mission.id}:${i}`), policy);
      after.claimedMissionIds = [...(state.claimedMissionIds ?? []), mission.id];
    } else if (action === 'set_home') {
      after = structuredClone(state);
      if (payload.characterId !== undefined) {
        if (!state.characters.some(c => c.id === payload.characterId) || !CHARACTER_MASTERS.some(c => c.id === payload.characterId)) throw new ApiError('未所持の武将です。');
        after.homeCharacterId = payload.characterId;
      }
      if (payload.backgroundId !== undefined) {
        if (!['castle-town', 'castle-approach'].includes(payload.backgroundId)) throw new ApiError('背景が不正です。');
        after.homeBackgroundId = payload.backgroundId;
      }
    } else if (action === 'raid_unlock') {
      const master = getRaidMaster(String(payload.masterId));
      if (master.type !== 'unlock' || state.materials.unlock < 1) throw new ApiError('レイド解禁札が足りません。');
      after = structuredClone(state); after.materials.unlock--;
      room = createRaidRoom(master.id, user.id, requestId, Date.now()); version = -1;
      room.participants[0].name = profile.username;
    } else if (['raid_join', 'raid_leave', 'raid_rescue', 'raid_claim', 'encounter_ignore'].includes(action)) {
      const current = await roomFor(String(payload.roomId)); version = current.version;
      const changed = applyRaidAction(current, state, action, { name: profile.username }, Date.now(), action === 'raid_claim' ? await rewardPolicy() : undefined); room = changed.room; after = changed.state;
    } else after = applyGrowthAction(state, action, payload);
    await commit(state, after, requestId, null, room, version);
    return new Response(JSON.stringify(await responseFor(user.id)), { headers });
  } catch (error) {
    const conflict = error instanceof ApiError && error.status === 409;
    const message = conflict ? '他の操作で更新されました。再読み込みしてお試しください。' : error instanceof Error ? error.message : '処理に失敗しました。';
    return new Response(JSON.stringify({ error: message }), { status: error instanceof ApiError ? error.status : 400, headers });
  }
});
