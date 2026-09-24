// Bundled with the shared pure gameplay modules before Edge deployment.
import { BATTLE_RULES, prepareBattleWaves, buildBattleParty, buildInitialState, importLegacyAssets, grantReward, CHARACTER_MASTERS, type LegacyAssets } from '../../../src/domain/redesign/masters.ts';
import { applyAcquisitionEvents, type AcquisitionEvent, type AcquisitionMaster } from '../../../src/domain/redesign/acquisitions.ts';
import { applyPlayerExperience, GROWTH_VERSION } from '../../../src/domain/redesign/growthMaster.ts';
import { applyNormalGacha, normalGachaDay } from '../../../src/domain/redesign/normalGacha.ts';
import { applyGrowthAction, validateDeck } from '../../../src/domain/redesign/growth.ts';
import { applyHomeSelection } from '../../../src/domain/redesign/home.ts';
import { applyShopExchange, applyShopEnergyDrink } from '../../../src/domain/redesign/shop.ts';
import { evaluateMissions, getClaimableMission, type MissionConfig } from '../../../src/domain/redesign/missions.ts';
import { simulateBattle } from '../../../src/domain/redesign/battle.ts';
import { getQuestStage as getLegacyQuestStage } from '../../../src/domain/redesign/legacyQuests.ts';
import { createQuestBattleInput, questEnergyCost, questVictoryRewards, QUEST_MASTER_VERSION, type FormalQuestStage } from '../../../src/domain/redesign/questMaster.ts';
import { getQuestStage, isQuestStageUnlocked } from '../../../src/domain/redesign/quests.ts';
import { characterArt } from '../../../src/theme/creativeAssets.ts';
import { applyRaidAction, createRaidRoom, getRoomRaidMaster, raidEnemies } from '../../../src/domain/redesign/raid.ts';
import { createFormalBattleInput } from '../../../src/domain/redesign/formalBattleInput.ts';
import { createFormalInvasionMaster } from '../../../src/domain/redesign/raidInvasionMaster.ts';
import { selectEncounterMaster } from '../../../src/domain/redesign/raidFormalMaster.ts';
import { projectTerritory, isTerritoryUnlocked, TERRITORY_HOST_POLICY_VERSION } from '../../../src/domain/redesign/territory.ts';
import type { TerritoryMaster, TerritoryProgress } from '../../../src/domain/redesign/types.ts';
import type { BattleInput, RaidRoom, RedesignState, Reward } from '../../../src/domain/redesign/types.ts';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const url = Deno.env.get('SUPABASE_URL')!;
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const EXPECTED_PROJECT = 'lrgyllgzcdcphlbmkknc';
class ApiError extends Error { constructor(message: string, public status = 400) { super(message); } }
async function db(path: string, body?: unknown): Promise<any> {
  const response = await fetch(`${url}/rest/v1/${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  let result: any;
  try { result = await response.json(); } catch { throw new ApiError('接続が混み合っています。少し待って再度お試しください。', 503); }
  if (!response.ok) {
    const messages: Record<string, string> = {
      TERRITORY_LEVEL_REQUIRED: '主催者Lvが不足しています。',
      TERRITORY_FEATURE_LOCKED: '領土侵攻は通常クエスト3-5クリアで解放されます。',
      TERRITORY_HOSTING_SLOTS_FULL: '同時開催枠が埋まっています。開催中の侵攻を確認してください。',
      TERRITORY_ITEM_REQUIRED: '開催アイテムが不足しています。',
      TERRITORY_DESTINATION_NOT_FOUND: '侵攻先が見つかりません。再読み込みしてください。',
      REQUEST_ID_REUSED: 'この操作は処理済みです。再読み込みしてください。',
    };
    throw new ApiError(messages[result.message] ?? result.message ?? 'データを保存できませんでした。', result.code === '40001' ? 409 : response.status >= 500 ? 503 : 400);
  }
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
    const state: RedesignState = await rpc('game04_get_growth_state', { p_user_id: userId, p_initial: buildInitialState(userId, input.legacy) });
    const migrated = importLegacyAssets(state, input.legacy);
    const imported = applyAcquisitionEvents(migrated, input.events, input.master);
    if (JSON.stringify(imported) === JSON.stringify(state)) return state;
    try { return (await commit(state, imported, crypto.randomUUID())).state; }
    catch (error) { if (!(error instanceof ApiError) || error.status !== 409 || attempt === 3) throw error; }
  }
  throw new ApiError('データ更新中です。もう一度お試しください。', 409);
}
async function commit(before: RedesignState, after: RedesignState, requestId: string, battle: unknown = null, room: (RaidRoom & {version?: number}) | null = null, roomVersion: number | null = null, receipt: Record<string, unknown> = {}) {
  return rpc('game04_commit_growth_state', { p_user_id: before.userId, p_expected_version: before.version, p_state: after,
    p_cash_delta: after.cash - before.cash, p_energy_delta: after.energy - before.energy, p_request_id: requestId,
    p_battle: battle, p_raid: room, p_raid_expected_version: roomVersion, p_receipt: receipt });
}
async function roomFor(id: string): Promise<RaidRoom & {version: number}> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError('レイドが不正です。');
  const [row] = await db(`game04_raid_rooms?id=eq.${id}&select=state,version`);
  if (!row) throw new ApiError('レイドが見つかりません。', 404);
  return { ...row.state, version: row.version };
}
async function roomsFor(userId: string): Promise<(RaidRoom & {version: number})[]> {
  const rows = await rpc('game04_raid_rooms_for_user', {p_user_id: userId});
  // Resolve the actual owner's equipped leader, never the viewer or the boss.
  const ownerIds = [...new Set<string>(rows.map((row: any) => row.state.ownerId))];
  const [profiles, players] = ownerIds.length ? await Promise.all([
    db(`users?id=in.(${ownerIds.join(',')})&select=id,username`),
    db(`game04_player_state?user_id=in.(${ownerIds.join(',')})&select=user_id,state`),
  ]) : [[], []];
  return rows.map((row: any) => {
    const profile = profiles.find((entry: any) => entry.id === row.state.ownerId);
    const player = players.find((entry: any) => entry.user_id === row.state.ownerId);
    const leader = CHARACTER_MASTERS.find(entry => entry.id === player?.state?.deck?.[0]?.characterId);
    return { ...row.state, version: row.version,
      participants: row.state.participants.map((participant: any) => participant.userId === row.state.ownerId
        ? { ...participant, name: profile?.username ?? participant.name, portraitUrl: leader ? characterArt(leader, 'portrait') : undefined }
        : participant),
      status: row.state.status === 'active' && Date.parse(row.state.expiresAt) <= Date.now() ? 'expired' : row.state.status,
    };
  });
}
async function territoryContext(userId: string): Promise<{master: TerritoryMaster; progress: TerritoryProgress; activeHostingCount: number; items: Record<string, number>}> {
  return rpc('game04_territory_context', {p_user_id: userId});
}
async function rewardPolicy(): Promise<AcquisitionMaster> {
  const [row] = await db('game04_redesign_master?key=eq.acquisition_conversion&select=data');
  if (!row?.data) throw new ApiError('獲得設定を確認できません。', 503);
  return row.data;
}
async function questPlayerExpReward(stageId: string) {
  const [row] = await db("game04_redesign_master?key=eq.quest_player_exp&select=status,data");
  const amount = row?.data?.stages?.[stageId];
  if (amount === void 0) return { amount: 0, version: row?.data?.version ?? "UNCONFIGURED", status: "UNCONFIGURED" };
  if (!Number.isSafeInteger(amount) || amount < 0 || !row?.data?.version) throw new ApiError("クエストEXP設定が不正です。", 503);
  return { amount, version: row.data.version, status: row.status };
}
async function missionConfig(): Promise<MissionConfig> {
  const [row] = await db('game04_redesign_master?key=eq.missions&select=data');
  return row?.data ?? { enabled: false, missions: [] };
}
async function responseFor(userId: string, extra: Record<string, unknown> = {}) {
  const statePromise = stateFor(userId);
  const [state, rooms, socialEvents, pending, territory, missions] = await Promise.all([statePromise, roomsFor(userId),
    db('game04_social_events?select=*&order=created_at.desc&limit=30'),
    db(`game04_battles?user_id=eq.${userId}&status=eq.started&select=id,kind,target_id&order=created_at.asc&limit=1`),
    statePromise.then(() => territoryContext(userId)), missionConfig(),
  ]);
  return { state, rooms, socialEvents, missions: evaluateMissions(state, missions), territory: projectTerritory(territory.master, territory.progress, territory.items, territory.activeHostingCount), pendingBattle: pending[0] ?? null, ...extra };
}
async function runBattle(userId: string, name: string, payload: any, id: string, playerName: string) {
  let preparedBattle: ReturnType<typeof simulateBattle> | undefined;
  let [record] = await db(`game04_battles?id=eq.${id}&user_id=eq.${userId}&select=*`);
  if (record?.status === 'settled') return responseFor(userId, record.result);
  if (!record) {
    const outstanding = await db(`game04_battles?user_id=eq.${userId}&status=eq.started&select=id&limit=1`);
    if (outstanding.length) throw new ApiError('未完了の戦闘を再開してください。', 409);
    const state = await stateFor(userId); validateDeck(state, state.deck);
    const kind = name === 'quest_battle' ? 'quest' : 'raid';
    let waves: BattleInput['waves'], cost: number, targetId: string, raidLevel: number | undefined;
    let questStage: FormalQuestStage | undefined;
    let startRoom: (RaidRoom & {version: number}) | null = null;
    if (kind === 'quest') {
      const stage = getQuestStage(String(payload.stageId));
      if (!stage || !isQuestStageUnlocked(stage.id, state.clearedStages)) throw new ApiError('このステージは未解放です。');
      questStage = stage; waves = stage.waves; cost = questEnergyCost(stage, state); targetId = stage.id;
    } else {
      const room = await roomFor(String(payload.roomId)), master = getRoomRaidMaster(room);
      const me = room.participants.find(p => p.userId === userId);
      if (room.status !== 'active' || Date.parse(room.expiresAt) <= Date.now() || !me || me.leftAt) throw new ApiError('参加できる開催中レイドを選んでください。');
      if (master.type === 'unlock' && room.territorySnapshot?.masterVersion === TERRITORY_HOST_POLICY_VERSION && !isTerritoryUnlocked(state)) throw new ApiError('領土侵攻は通常クエスト3-5クリアで解放されます。');
      startRoom = room;
      raidLevel = payload.level === undefined ? room.level : Number(payload.level);
      if(!Number.isInteger(raidLevel)||raidLevel<me.joinedLevel||raidLevel>room.level||(master.type!=='unlock'&&raidLevel!==room.level))throw new ApiError('この段階には挑戦できません。');
      waves = [raidEnemies(master, raidLevel)]; cost = master.energyCost; targetId = room.id;
    }
    if (state.energy < cost) throw new ApiError('行動力が足りません。');
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    // Only a new battle receives current rules. Saved started/settled records above are never upgraded.
    const rules = startRoom?.territorySnapshot?.battleRules ?? BATTLE_RULES;
    const input = questStage ? createQuestBattleInput(seed, buildBattleParty(state, rules), questStage, rules) : startRoom && getRoomRaidMaster(startRoom).masterVersion ? {...createFormalBattleInput(seed,buildBattleParty(state,rules),waves as (import('../../../src/domain/redesign/types.ts').EnemyUnit & {initialSp:number})[][],rules),raidLevel,raidMasterVersion:getRoomRaidMaster(startRoom).masterVersion,playerExpReward:{amount:getRoomRaidMaster(startRoom).playerExp??0,version:getRoomRaidMaster(startRoom).masterVersion,status:'APPROVED'}} : { seed, party: buildBattleParty(state, rules), waves: startRoom?.territorySnapshot ? structuredClone(waves) : prepareBattleWaves(waves, rules), rules, raidLevel,  };
    // Validate and simulate before charging. Invalid provisional masters must not strand a paid pending battle.
    preparedBattle = simulateBattle(input);
    await commit(state, { ...state, energy: state.energy - cost, ...(questStage ? {questAttempts:{...state.questAttempts,[targetId]:(state.questAttempts?.[targetId]??0)+1},questProgressVersion:QUEST_MASTER_VERSION} : {}) }, id, { id, kind, targetId, seed, input, status: 'started' }, startRoom, startRoom?.version ?? null);
    // A simultaneous retry may have committed another seed under this request ID.
    // Always settle the persisted input, never this caller's discarded candidate.
    [record] = await db(`game04_battles?id=eq.${id}&user_id=eq.${userId}&select=*`);
    if (!record) throw new ApiError('戦闘の保存状態を確認できません。再開してください。', 503);
    if (record.status === 'settled') return responseFor(userId, record.result);
    if (JSON.stringify(record.input) !== JSON.stringify(input)) preparedBattle = undefined;
  }
  const battle = preparedBattle ?? simulateBattle(record.input);
  const settlementId = await uuidFor(`settlement:${id}`);
  for (let attempt = 0; attempt < 4; attempt++) {
    const state = await stateFor(userId); let after = structuredClone(state);
    let room: (RaidRoom & {version?: number}) | null = null, version: number | null = null;
    let playerGrowth: Record<string, unknown> | undefined;
    const rewards: Reward[] = []; let firstClear = false, encounterRaidId: string | null = null;
    if (record.kind === 'quest' && battle.outcome === 'win') {
      const stage = record.input.questSnapshot ?? getLegacyQuestStage(record.target_id);
      if (!stage) throw new ApiError('保存されたステージが見つかりません。', 503);
      firstClear = !state.clearedStages.includes(stage.id);
      let rng = record.seed >>> 0;
      const random = () => { rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0; return rng / 4294967296; };
      const luck = record.input.party.reduce((n: number, p: any) => n + p.stats.luk, 0) / 5;
      let encounterRoll: number | undefined;
      if (record.input.questMasterVersion === QUEST_MASTER_VERSION) {
        const settlement = questVictoryRewards(stage, state, record.input.party, record.seed);
        rewards.push(...settlement.rewards);
        firstClear = settlement.firstClear;
        after.questClearCounts = {...after.questClearCounts, [stage.id]:settlement.count};
        encounterRoll = settlement.encounterRoll;
      } else {
        rewards.push(...stage.rewards, ...(firstClear ? stage.firstRewards : []), ...stage.rareRewards.filter((r: Reward) => random() < Math.min(1, (r.chance ?? 0) * (1 + luck / 1000))));
      }
      const policy = await rewardPolicy();
      for (let i = 0; i < rewards.length; i++) after = grantReward(after, rewards[i], await uuidFor(`reward:${id}:${i}`), policy);
      if (firstClear) after.clearedStages.push(stage.id);
      const expReward = record.input.playerExpReward;
      if (expReward) {
        const progress = state.playerProgress;
        if (progress?.version === GROWTH_VERSION && progress.status === "active") {
          const grown = applyPlayerExperience(progress.level, progress.exp, expReward.amount, after.energy, after.energyMax);
          after.playerProgress = { ...progress, level: grown.level, exp: grown.exp };
          after.energy = grown.energy;
          playerGrowth = {
            status: expReward.status,
            rewardVersion: expReward.version,
            offeredExp: expReward.amount,
            gainedExp: grown.exp - progress.exp,
            beforeLevel: progress.level,
            level: grown.level,
            exp: grown.exp,
            energyRecovered: grown.energy - state.energy,
            energy: grown.energy,
            energyMax: state.energyMax
          };
        } else playerGrowth = { status: "MIGRATION_PENDING", offeredExp: expReward.amount, gainedExp: 0 };
      }
      if ((encounterRoll ?? random()) < stage.encounterChance && !(await roomsFor(userId)).some(existing => existing.ownerId === userId && existing.status === 'active' && Date.parse(existing.expiresAt) > Date.now() && !existing.territorySnapshot && getRoomRaidMaster(existing).type === 'encounter')) {
        encounterRaidId = await uuidFor(`encounter:${id}`);
        const encounterMaster=record.input.questMasterVersion===QUEST_MASTER_VERSION?selectEncounterMaster(Number(stage.designId.split('-')[0]),random):null;
        room = createRaidRoom(encounterMaster?.id??'encounter_flame', userId, encounterRaidId, Date.now()); room.participants[0].name = playerName; version = -1;
      }
    } else if (record.kind === 'raid') {
      const currentRoom = await roomFor(record.target_id); version = currentRoom.version;
      const transition = applyRaidAction(currentRoom, after, 'raid_battle', { battleId: id, battleLevel: record.input.raidLevel, result: battle, energyAlreadyPaid: true, seed:record.seed, luck:record.input.party.reduce((sum:number,p:any)=>sum+Math.max(0,Math.min(100,p.stats.luk)),0)/5 });
      room = transition.room; after = transition.state; rewards.push(...transition.rewards);
      if(battle.outcome==='win'&&record.input.raidMasterVersion&&record.input.playerExpReward?.amount){
        const progress=after.playerProgress, amount=record.input.playerExpReward.amount;
        if(progress?.version===GROWTH_VERSION&&progress.status==='active'){
          const priorEnergy=after.energy;const grown=applyPlayerExperience(progress.level,progress.exp,amount,after.energy,after.energyMax);
          after.playerProgress={...progress,level:grown.level,exp:grown.exp};after.energy=grown.energy;
          playerGrowth={status:'APPROVED',rewardVersion:record.input.raidMasterVersion,offeredExp:amount,gainedExp:amount,beforeLevel:progress.level,level:grown.level,exp:grown.exp,energyRecovered:grown.energy-priorEnergy,energy:grown.energy,energyMax:after.energyMax};
        }else playerGrowth={status:'MIGRATION_PENDING',offeredExp:amount,gainedExp:0};
      }

    }
    const result = { battle, rewards, firstClear, encounterRaidId, ...(playerGrowth ? { playerGrowth } : {}) };
    try {
      const settled = await commit(state, after, settlementId, { id, status: 'settled', result }, room, version);
      return responseFor(userId, settled.battleResult ?? result);
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
    if (action === "normal_gacha_status") {
      const state2 = await stateFor(user.id);
      const pool = await db("gacha_items_master?gacha_id=in.(CHAR_NORMAL,SKILL_NORMAL,EQUIP_NORMAL)&select=gacha_id,item_id,item_type,rarity&limit=1000");
      const day = normalGachaDay(Date.now());
      return new Response(JSON.stringify(await responseFor(user.id, { normalGacha: { pool, day, available: state2.dailyNormalGachaDate !== day } })), { headers });
    }
    if (action === 'get_state' || action === 'raid_refresh') return new Response(JSON.stringify(await responseFor(user.id)), { headers });
    if (action === 'quest_battle' || action === 'raid_battle') return new Response(JSON.stringify(await runBattle(user.id, action, payload, requestId, profile.username)), { headers });
    if (action === 'territory_host' || action === 'raid_unlock') {
      await stateFor(user.id);
      let destinationId = String(payload.destinationId ?? '');
      if (action === 'raid_unlock') {
        const context = await territoryContext(user.id);
        destinationId = context.master.destinations.find(d => d.raidMasterId === String(payload.masterId))?.id ?? '';
      }
      const context=await territoryContext(user.id), destination=context.master.destinations.find(d=>d.id===destinationId);
      if(!destination)throw new ApiError('侵攻先が見つかりません。');
      if(destination.unavailableReason)throw new ApiError(destination.unavailableReason);
      const formalMaster=context.master.raidMasters.find(m=>m.id===destination.raidMasterId);
      const hosted = formalMaster?.masterVersion
        ? await rpc('game04_host_formal_territory', {p_user_id:user.id,p_request_id:requestId,p_destination_id:destinationId,p_raid_master:createFormalInvasionMaster(formalMaster.id,()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296)})
        : await rpc('game04_host_territory', {p_user_id: user.id, p_request_id: requestId, p_destination_id: destinationId});
      return new Response(JSON.stringify(await responseFor(user.id, {territoryRoomId: hosted.room.id})), {headers});
    }
    const [prior] = await db(`game04_requests?user_id=eq.${user.id}&request_id=eq.${requestId}&select=request_id,result`);
    if (prior) {
      const response = await responseFor(user.id, prior.result?.receipt ?? {});
      if (action === "normal_gacha") {
        const pool = await db("gacha_items_master?gacha_id=in.(CHAR_NORMAL,SKILL_NORMAL,EQUIP_NORMAL)&select=gacha_id,item_id,item_type,rarity&limit=1000");
        const day = normalGachaDay(Date.now());
        return new Response(JSON.stringify({ ...response, normalGacha: { pool, day, available: response.state.dailyNormalGachaDate !== day } }), { headers });
      }
      return new Response(JSON.stringify(response), { headers });
    }
    const state = await stateFor(user.id); let after: RedesignState, room: RaidRoom | null = null, version: number | null = null;
    if (action === "normal_gacha") {
      const pool = await db("gacha_items_master?gacha_id=in.(CHAR_NORMAL,SKILL_NORMAL,EQUIP_NORMAL)&select=gacha_id,item_id,item_type,rarity&limit=1000");
      const drawn = applyNormalGacha(state, payload, pool, requestId, Date.now(), await rewardPolicy(), () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296);
      const receipt = { normalGachaResults: drawn.results, normalGachaCost: drawn.cost, normalGachaMasterVersion: drawn.masterVersion };
      const saved = await commit(state, drawn.state, requestId, null, null, null, receipt);
      const day = normalGachaDay(Date.now());
      return new Response(JSON.stringify(await responseFor(user.id, { ...saved.receipt ?? receipt, normalGacha: { pool, day, available: saved.state?.dailyNormalGachaDate !== day } })), { headers });
    }
    if (action === 'claim_mission') {
      const mission = getClaimableMission(state, await missionConfig(), String(payload.missionId));
      after = structuredClone(state);
      const policy = await rewardPolicy();
      for (let i = 0; i < mission.rewards.length; i++) after = grantReward(after, mission.rewards[i], await uuidFor(`mission:${user.id}:${mission.id}:${i}`), policy);
      after.claimedMissionIds = [...(state.claimedMissionIds ?? []), mission.id];
    } else if (action === 'set_home') {
      try { after = applyHomeSelection(state, payload); }
      catch (error) { throw new ApiError(error instanceof Error ? error.message : '本陣の変更を保存できませんでした。'); }
    } else if (action === 'shop_exchange') {
      after = applyShopExchange(state, payload);
      await rpc('game04_commit_shop_exchange', { p_user_id: state.userId, p_expected_version: state.version, p_state: after, p_before_diamonds: state.diamonds, p_diamond_cost: state.diamonds - after.diamonds, p_cash_delta: after.cash - state.cash, p_request_id: requestId });
      return new Response(JSON.stringify(await responseFor(user.id)), { headers });
    } else if (action === 'use_energy_drink') {
      after = applyShopEnergyDrink(state);
    } else if (['raid_join', 'raid_leave', 'raid_rescue', 'raid_claim', 'encounter_ignore'].includes(action)) {
      const current = await roomFor(String(payload.roomId)); version = current.version;
      if (action === 'raid_join' && getRoomRaidMaster(current).type === 'unlock' && !current.participants.some(p => p.userId === user.id && !p.leftAt) && !isTerritoryUnlocked(state)) throw new ApiError('領土侵攻は通常クエスト3-5クリアで解放されます。');
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
