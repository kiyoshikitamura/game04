// Bundled with the shared pure gameplay modules before Edge deployment.
import { BATTLE_RULES, prepareBattleWaves, buildBattleParty, buildInitialState, importLegacyAssets, grantReward, CHARACTER_MASTERS, type LegacyAssets } from '../../../src/domain/redesign/masters.ts';
import { applyAcquisitionEvents, type AcquisitionEvent, type AcquisitionMaster } from '../../../src/domain/redesign/acquisitions.ts';
import { applyPlayerExperience, GROWTH_VERSION } from '../../../src/domain/redesign/growthMaster.ts';
import { normalGachaDay } from '../../../src/domain/redesign/normalGacha.ts';
import { applyFormalNormalGacha, applyFormalSpecialGacha, applyFormalSsrExchange, formalGachaDisplayRates, type FormalGachaReceipt } from '../../../src/domain/redesign/formalGacha.ts';
import { FORMAL_GACHA_VERSION, GACHA_CATEGORIES, NORMAL_GACHA_RULE, SPECIAL_GACHA_RULES, SPECIAL_GACHA_TICKET_IDS, normalGachaPool, specialGachaPool } from '../../../src/domain/redesign/formalGachaMaster.ts';
import { applyGrowthAction, validateDeck } from '../../../src/domain/redesign/growth.ts';
import { applyHomeSelection, synchronizeHomeBackgroundUnlocks } from '../../../src/domain/redesign/home.ts';
import { applyShopExchange, applyShopEnergyDrink } from '../../../src/domain/redesign/shop.ts';
import { evaluateMissions, getClaimableMission, type MissionConfig } from '../../../src/domain/redesign/missions.ts';
import { FORMAL_MISSION_CONFIG } from '../../../src/domain/redesign/formalMissions.ts';
import { gameplayMeasurementReceipt, raidClaimMeasurementReceipt } from '../../../src/domain/redesign/gameplayMeasurement.ts';
import { captureMissionAssets, recordMissionEvent } from '../../../src/domain/redesign/missionProgress.ts';
import { raidBattleMissionEvent, raidRescueMissionEvent, reconcileRaidMissionProgress } from '../../../src/domain/redesign/missionRaidProgress.ts';
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
const EXPECTED_PROJECT = 'znakrkaazliexzwihxge';
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
      GACHA_DAY_CHANGED: '日付が変わりました。同じ操作でもう一度お試しください。',
      EXPIRED_ASSET_BALANCE: '有効なアイテムが不足しています。',
      INSUFFICIENT_RESOURCE: '所持数が不足しています。',
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
async function stateFor(userId: string, acquired?: Awaited<ReturnType<typeof acquisitionInput>>): Promise<RedesignState> {
  const input = acquired ?? await acquisitionInput(userId);
  for (let attempt = 0; attempt < 4; attempt++) {
    const state: RedesignState = await rpc('game04_get_session_state', { p_user_id: userId, p_initial: buildInitialState(userId, input.legacy) });
    const migrated = importLegacyAssets(state, input.legacy);
    const imported = captureMissionAssets(synchronizeHomeBackgroundUnlocks(applyAcquisitionEvents(migrated, input.events, input.master)));
    if (JSON.stringify(imported) === JSON.stringify(state)) return state;
    try { return (await commit(state, imported, crypto.randomUUID())).state; }
    catch (error) { if (!(error instanceof ApiError) || error.status !== 409 || attempt === 3) throw error; }
  }
  throw new ApiError('データ更新中です。もう一度お試しください。', 409);
}
async function commit(before: RedesignState, after: RedesignState, requestId: string, battle: unknown = null, room: (RaidRoom & {version?: number}) | null = null, roomVersion: number | null = null, receipt: Record<string, unknown> = {}) {
  return rpc('game04_commit_growth_state', { p_user_id: before.userId, p_expected_version: before.version, p_state: captureMissionAssets(synchronizeHomeBackgroundUnlocks(after)),
    p_cash_delta: after.cash - before.cash, p_energy_delta: after.energy - before.energy, p_request_id: requestId,
    p_battle: battle, p_raid: room, p_raid_expected_version: roomVersion, p_receipt: receipt });
}
async function commitGacha(before: RedesignState, after: RedesignState, requestId: string, diamondCost: number, operation: string, requestPayload: Record<string, unknown>, receipt: Record<string, unknown>) {
 const persistentState = captureMissionAssets(synchronizeHomeBackgroundUnlocks(structuredClone(after)));
 delete persistentState.gachaTicketBalances;
 return rpc('game04_commit_gacha', {p_user_id:before.userId,p_expected_version:before.version,p_state:persistentState,p_cash_delta:after.cash-before.cash,p_before_diamonds:before.diamonds,p_diamond_cost:diamondCost,p_request_id:requestId,p_operation:operation,p_request_payload:requestPayload,p_receipt:receipt});
}
async function roomFor(id: string): Promise<RaidRoom & {version: number}> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError('レイドが不正です。');
  const [row] = await db(`game04_raid_rooms?id=eq.${id}&select=state,version`);
  if (!row) throw new ApiError('レイドが見つかりません。', 404);
  return { ...row.state, version: row.version };
}
async function roomsFor(userId: string): Promise<(RaidRoom & {version: number})[]> {
  const rows = await rpc('game04_raid_rooms_with_owners', {p_user_id: userId});
  // Preserve the existing owner projection; SQL only collapses dependent reads.
  return rows.map((row: any) => {
    const leader = CHARACTER_MASTERS.find(entry => entry.id === row.ownerLeaderCharacterId);
    return { ...row.state, version: row.version,
      participants: row.state.participants.map((participant: any) => participant.userId === row.state.ownerId
        ? { ...participant, name: row.ownerName ?? participant.name, portraitUrl: leader ? characterArt(leader, 'portrait') : undefined }
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
async function missionConfig(): Promise<MissionConfig> { return FORMAL_MISSION_CONFIG; }
function normalGachaCompatibilityPool() {
  const ids={character:'CHAR_NORMAL',skill:'SKILL_NORMAL',equipment:'EQUIP_NORMAL'} as const;
  return normalGachaPool().map(row=>({gacha_id:ids[row.category],item_id:row.id,item_type:row.category.toUpperCase(),rarity:row.rarity}));
}
const formalTicketIds = Object.values(SPECIAL_GACHA_TICKET_IDS);
async function gachaTicketBalances(userId: string): Promise<Record<string, number>> {
  const rows = await db(`user_items?user_id=eq.${userId}&item_id=in.(${formalTicketIds.join(',')})&select=item_id,quantity`);
  const balances = Object.fromEntries(formalTicketIds.map((id) => [id, 0]));
  for (const row of rows) {
    if (!formalTicketIds.includes(row.item_id) || !Number.isSafeInteger(Number(row.quantity)) || Number(row.quantity) < 0) throw new ApiError('ガチャ券残数を確認できません。', 503);
    balances[row.item_id] = Number(row.quantity);
  }
  return balances;
}
function formalGachaCatalog(state: RedesignState, tickets: Record<string, number>, now: number) {
  const day = normalGachaDay(now);
  const categories = Object.fromEntries(GACHA_CATEGORIES.map(category=>[category,{rule:SPECIAL_GACHA_RULES[category],pool:specialGachaPool(category),rates:formalGachaDisplayRates('special',category)}]));
  return {masterVersion:FORMAL_GACHA_VERSION,normal:{rule:NORMAL_GACHA_RULE,pool:normalGachaPool(),rates:formalGachaDisplayRates('normal'),day,freeAvailable:state.dailyNormalGachaDate!==day},special:{categories,points:state.specialGachaPoints??{},tickets}};
}
function normalizedGachaRequestPayload(action: string, payload: any): Record<string, unknown> {
  if (action === 'normal_gacha') return {count:Number(payload.count),payment:String(payload.currency??payload.payment).toUpperCase()};
  if (action === 'special_gacha') return {category:String(payload.category??''),count:Number(payload.count),payment:String(payload.payment??'').toUpperCase()};
  return {category:String(payload.category??''),itemId:String(payload.itemId??'')};
}
function canonicalJson(value: unknown): string {
  if (value === undefined) return '"__undefined__"';
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.entries(value as Record<string, unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>`${JSON.stringify(key)}:${canonicalJson(item)}`).join(',')}}`;
  return JSON.stringify(value);
}
function gachaMeasurementReceipt(action: 'normal_gacha'|'special_gacha'|'special_gacha_exchange', before: RedesignState, after: RedesignState, receipt: FormalGachaReceipt) {
  const category = receipt.category ?? 'mixed';
  const pointsAfter = receipt.category ? after.specialGachaPoints?.[receipt.category] ?? 0 : 0;
  const resultSummary = [...new Map(receipt.results.map(result => {
    const key = `${result.category}:${result.rarity}:${result.acquisition}`;
    return [key, { category:result.category, rarity:result.rarity, acquisition:result.acquisition,
      count:receipt.results.filter(candidate => `${candidate.category}:${candidate.rarity}:${candidate.acquisition}` === key).length,
      convertedAmount:receipt.results.filter(candidate => `${candidate.category}:${candidate.rarity}:${candidate.acquisition}` === key).reduce((sum,candidate) => sum+candidate.convertedAmount,0) }];
  })).values()];
  return { gameplayMeasurement: {
    contractVersion:'game04-gameplay-v1', action,
    stateVersionBefore:before.version, stateVersionAfter:before.version+1,
    cashDelta:after.cash-before.cash, energyDelta:0,
    gacha:{ masterVersion:receipt.masterVersion, category, count:receipt.count, payment:receipt.payment,
      diamondCost:receipt.payment==='DIAMONDS'?receipt.cost:0,
      cashCost:receipt.payment==='CASH'?receipt.cost:0,
      ticketCost:receipt.payment==='TICKET'?receipt.cost:0,
      pointsAdded:receipt.pointsAdded, pointsSpent:receipt.kind==='exchange'?receipt.cost:0, pointsAfter,
      exchangeItemId:receipt.kind==='exchange'?receipt.results[0]?.id??null:null,
      resultSummary },
  } };
}
async function responseFor(userId: string, extra: Record<string, unknown> = {}, committedState?: RedesignState) {
  // Reuse the authoritative state returned by this request's atomic commit.
  // Conflict/replay/read paths still load current state; never substitute a client draft.
  const statePromise = committedState ? Promise.resolve(committedState) : stateFor(userId);
  const [loadedState, rooms, socialEvents, pending, territory, missions] = await Promise.all([statePromise, roomsFor(userId),
    db('game04_social_events?select=*&order=created_at.desc&limit=30'),
    db(`game04_battles?user_id=eq.${userId}&status=eq.started&select=id,kind,target_id&order=created_at.asc&limit=1`),
    statePromise.then(() => territoryContext(userId)), missionConfig(),
  ]);
  let state = loadedState;
  for (let attempt = 0; attempt < 3; attempt++) {
    const reconciled = reconcileRaidMissionProgress(state, rooms, Date.now());
    if (JSON.stringify(reconciled) === JSON.stringify(state)) break;
    try { state = (await commit(state, reconciled, crypto.randomUUID())).state; break; }
    catch (error) { if (!(error instanceof ApiError) || error.status !== 409 || attempt === 2) throw error; state = await stateFor(userId); }
  }
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
    const battleInput = questStage ? createQuestBattleInput(seed, buildBattleParty(state, rules), questStage, rules) : startRoom && getRoomRaidMaster(startRoom).masterVersion ? {...createFormalBattleInput(seed,buildBattleParty(state,rules),waves as (import('../../../src/domain/redesign/types.ts').EnemyUnit & {initialSp:number})[][],rules),raidLevel,raidMasterVersion:getRoomRaidMaster(startRoom).masterVersion,playerExpReward:{amount:getRoomRaidMaster(startRoom).playerExp??0,version:getRoomRaidMaster(startRoom).masterVersion,status:'APPROVED'}} : { seed, party: buildBattleParty(state, rules), waves: startRoom?.territorySnapshot ? structuredClone(waves) : prepareBattleWaves(waves, rules), rules, raidLevel,  };
    const input = startRoom ? { ...battleInput, ...(getRoomRaidMaster(startRoom).damagePolicy ? {raidDamagePolicy:getRoomRaidMaster(startRoom).damagePolicy} : {}), raidStartSnapshot: { roomId: startRoom.id, level: startRoom.level, hp: startRoom.hp, maxHp: startRoom.maxHp } } : battleInput;
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
  const simulatedBattle = preparedBattle ?? simulateBattle(record.input);
  // Read only persisted start context. Never reconstruct old starts from the settled room.
  const battle = record.kind === 'raid' && record.input.raidStartSnapshot
    ? { ...simulatedBattle, raidStartSnapshot: record.input.raidStartSnapshot }
    : simulatedBattle;
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
      const raidEvent = raidBattleMissionEvent(currentRoom, transition.room, userId, id, battle.outcome, Date.now());
      if (raidEvent) after = recordMissionEvent(after, raidEvent);
      after = reconcileRaidMissionProgress(after, [transition.room], Date.now());
      if(battle.outcome==='win'&&record.input.raidMasterVersion&&record.input.playerExpReward?.amount){
        const progress=after.playerProgress, amount=record.input.playerExpReward.amount;
        if(progress?.version===GROWTH_VERSION&&progress.status==='active'){
          const priorEnergy=after.energy;const grown=applyPlayerExperience(progress.level,progress.exp,amount,after.energy,after.energyMax);
          after.playerProgress={...progress,level:grown.level,exp:grown.exp};after.energy=grown.energy;
          playerGrowth={status:'APPROVED',rewardVersion:record.input.raidMasterVersion,offeredExp:amount,gainedExp:amount,beforeLevel:progress.level,level:grown.level,exp:grown.exp,energyRecovered:grown.energy-priorEnergy,energy:grown.energy,energyMax:after.energyMax};
        }else playerGrowth={status:'MIGRATION_PENDING',offeredExp:amount,gainedExp:0};
      }

    }
    const missionCounters = record.kind === 'quest' ? ['battle'] : [];
    if (record.kind === 'quest' && battle.outcome === 'win') {
      missionCounters.push('quest_clear');
      if (record.input.party.length === 5) missionCounters.push('quest_five_party');
      if (record.input.party.some((unit: any) => unit.skills.length >= 2)) missionCounters.push('quest_skill_slot2');
      if (record.input.party.some((unit: any) => unit.skills.length >= 3)) missionCounters.push('quest_skill_slot3');
    }
    if (missionCounters.length) after = recordMissionEvent(after, { id: `battle:${id}`, at: Date.now(), counters: missionCounters });
    const result = { battle, rewards, firstClear, encounterRaidId, ...(playerGrowth ? { playerGrowth } : {}) };
    try {
      const settled = await commit(state, after, settlementId, { id, status: 'settled', result }, room, version);
      return responseFor(userId, settled.battleResult ?? result, settled.state);
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
    const { action:requestedAction, payload = {}, requestId } = await request.json();
    const action=requestedAction==='formal_gacha'?(payload.mode==='normal'?'normal_gacha':'special_gacha'):requestedAction==='formal_gacha_exchange'?'special_gacha_exchange':requestedAction;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) throw new ApiError('操作IDが不正です。');
    // Only read-only preparation overlaps. Never run session initialization, login
    // rewards or a commit before profile validation and the request replay check.
    const standardMutation = !['normal_gacha_status','special_gacha_status','formal_gacha_status','observe_state_restore','get_state','raid_refresh','quest_battle','raid_battle','territory_host','raid_unlock'].includes(action);
    const [[profile], priorRows, acquired] = await Promise.all([
      db(`users?id=eq.${user.id}&select=id,username`),
      standardMutation ? db(`game04_requests?user_id=eq.${user.id}&request_id=eq.${requestId}&select=request_id,result`) : Promise.resolve([]),
      standardMutation ? acquisitionInput(user.id).then(input => ({input}), error => ({error})) : Promise.resolve(undefined),
    ]);
    if (!profile) throw new ApiError('先にプレイヤー名を登録してください。', 409);
    if (action === "normal_gacha_status") {
      const response = await responseFor(user.id),state2=response.state;
      const pool = normalGachaCompatibilityPool();
      const day = normalGachaDay(Date.now());
      return new Response(JSON.stringify({...response,normalGacha:{pool,day,available:state2.dailyNormalGachaDate!==day,masterVersion:FORMAL_GACHA_VERSION,rule:NORMAL_GACHA_RULE,rates:formalGachaDisplayRates('normal')}}),{headers});
    }
    if (action === 'special_gacha_status') {
      const [response,tickets]=await Promise.all([responseFor(user.id),gachaTicketBalances(user.id)]),state2=response.state;
      const categories=Object.fromEntries(GACHA_CATEGORIES.map(category=>[category,{rule:SPECIAL_GACHA_RULES[category],pool:specialGachaPool(category),rates:formalGachaDisplayRates('special',category)}]));
      return new Response(JSON.stringify({...response,specialGacha:{masterVersion:FORMAL_GACHA_VERSION,categories,points:state2.specialGachaPoints??{},tickets}}),{headers});
    }
    if (action === 'formal_gacha_status') {
      const [response,tickets]=await Promise.all([responseFor(user.id),gachaTicketBalances(user.id)]),now=Date.now();
      return new Response(JSON.stringify({...response,formalGacha:formalGachaCatalog(response.state,tickets,now)}),{headers});
    }
    if (action === 'observe_state_restore') {
      const observedVersion = payload.observedVersion;
      if (!Number.isSafeInteger(observedVersion) || observedVersion < 0) throw new ApiError('観測バージョンが不正です。');
      const observation = await rpc('game04_observe_state_restore', { p_user_id: user.id, p_request_id: requestId, p_observed_version: observedVersion });
      return new Response(JSON.stringify({ observation }), { headers });
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
    const [prior] = priorRows;
    if (prior) {
      if (['normal_gacha','special_gacha','special_gacha_exchange'].includes(action)) {
        const requestPayload=normalizedGachaRequestPayload(action,payload);
        if(prior.result?.operation!==action||canonicalJson(prior.result?.requestPayload)!==canonicalJson(requestPayload))throw new ApiError('操作IDが別の操作ですでに使用されています。',409);
      } else {
        return new Response(JSON.stringify(await responseFor(user.id, prior.result?.receipt ?? {})), { headers });
      }
      const [response,tickets]=await Promise.all([responseFor(user.id, prior.result?.receipt ?? {}),gachaTicketBalances(user.id)]);
      const replayNow=Date.now();
      const responseWithCatalog={...response,replayed:true,formalGacha:formalGachaCatalog(response.state,tickets,replayNow)};
      if (action === "normal_gacha") {
        const pool = normalGachaCompatibilityPool();
        const day = normalGachaDay(replayNow);
        return new Response(JSON.stringify({ ...responseWithCatalog, normalGacha: { pool, day, available: response.state.dailyNormalGachaDate !== day } }), { headers });
      }
      return new Response(JSON.stringify(responseWithCatalog), { headers });
    }
    // A replay above deliberately ignores this speculative read and reloads current
    // state via the existing response path. Read failures cannot bypass mutation safety.
    if (acquired && 'error' in acquired) throw acquired.error;
    let measurementReceipt: Record<string, unknown> | undefined;
    const state = await stateFor(user.id, acquired?.input); let after: RedesignState, room: RaidRoom | null = null, version: number | null = null;
    if (action === "normal_gacha") {
      const pool = normalGachaCompatibilityPool();
      const payment=String(payload.currency??payload.payment).toUpperCase();
      const now=Date.now();
      const drawn=applyFormalNormalGacha(state,{requestId,count:Number(payload.count) as 1|10,payment:payment as 'CASH'|'FREE',now},()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296);
      drawn.state=recordMissionEvent(drawn.state,{id:`normal-gacha:${requestId}`,counters:['normal_gacha'],at:now});
      const normalGachaResults=drawn.receipt.results.map(result=>({id:result.id,kind:result.category,rarity:result.rarity,name:result.name,image:result.image,outcome:result.acquisition==='instance'?'装備を個体で獲得':result.acquisition==='new'?'新規獲得':result.category==='character'?`固有魂 +${result.convertedAmount}`:`スキルLB素材 +${result.convertedAmount}`}));
      const receipt = { operation:action,...gachaMeasurementReceipt(action,state,drawn.state,drawn.receipt),formalGachaReceipt:drawn.receipt,formalGachaResults:drawn.receipt.results,normalGachaResults,normalGachaCost:drawn.receipt.cost,normalGachaMasterVersion:drawn.receipt.masterVersion,normalGachaJstDay:normalGachaDay(now) };
      const saved = await commitGacha(state, drawn.state, requestId, 0, action, normalizedGachaRequestPayload(action,payload), receipt);
      const settledNow=Date.now(),day=normalGachaDay(settledNow);
      const [tickets,response]=await Promise.all([gachaTicketBalances(user.id),responseFor(user.id,{...(saved.receipt??receipt),replayed:Boolean(saved.replayed),normalGacha:{pool,day,available:saved.state?.dailyNormalGachaDate!==day}},saved.state)]);
      return new Response(JSON.stringify({...response,formalGacha:formalGachaCatalog(saved.state,tickets,settledNow)}),{headers});
    }
    if(action==='special_gacha'||action==='special_gacha_exchange'){
      const ticketBalances=await gachaTicketBalances(user.id);
      const projectedState={...state,gachaTicketBalances:ticketBalances};
      const resolved=action==='special_gacha'
       ?applyFormalSpecialGacha(projectedState,{requestId,category:payload.category,count:Number(payload.count) as 1|10,payment:String(payload.payment??'').toUpperCase() as 'DIAMONDS'|'TICKET'},()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296)
       :applyFormalSsrExchange(projectedState,{requestId,category:payload.category,itemId:String(payload.itemId??'')});
      const receipt={operation:action,...gachaMeasurementReceipt(action,state,resolved.state,resolved.receipt),formalGachaReceipt:resolved.receipt,formalGachaResults:resolved.receipt.results,specialGachaResults:resolved.receipt.results,specialGachaCost:resolved.receipt.payment==='DIAMONDS'?resolved.receipt.cost:0,specialGachaPoints:resolved.state.specialGachaPoints??{},specialGachaMasterVersion:resolved.receipt.masterVersion,specialGachaCategory:payload.category,specialGachaItemId:payload.itemId??null,specialGachaPayment:payload.payment??null};
      const requestPayload=normalizedGachaRequestPayload(action,payload);
      const saved=await commitGacha(state,resolved.state,requestId,resolved.receipt.payment==='DIAMONDS'?resolved.receipt.cost:0,action,requestPayload,receipt);
      const catalogNow=Date.now();
      const [updatedTickets,response]=await Promise.all([gachaTicketBalances(user.id),responseFor(user.id,{...(saved.receipt??receipt),replayed:Boolean(saved.replayed)},saved.state)]);
      return new Response(JSON.stringify({...response,formalGacha:formalGachaCatalog(saved.state,updatedTickets,catalogNow)}),{headers});
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
      after = synchronizeHomeBackgroundUnlocks(applyShopExchange(state, payload));
      const saved = await rpc('game04_commit_shop_exchange', { p_user_id: state.userId, p_expected_version: state.version, p_state: after, p_before_diamonds: state.diamonds, p_diamond_cost: state.diamonds - after.diamonds, p_cash_delta: after.cash - state.cash, p_request_id: requestId });
      return new Response(JSON.stringify(await responseFor(user.id, {}, saved?.state)), { headers });
    } else if (action === 'use_energy_drink') {
      after = applyShopEnergyDrink(state);
    } else if (['raid_join', 'raid_leave', 'raid_rescue', 'raid_claim', 'encounter_ignore'].includes(action)) {
      const current = await roomFor(String(payload.roomId)); version = current.version;
      if (action === 'raid_join' && getRoomRaidMaster(current).type === 'unlock' && !current.participants.some(p => p.userId === user.id && !p.leftAt) && !isTerritoryUnlocked(state)) throw new ApiError('領土侵攻は通常クエスト3-5クリアで解放されます。');
      const changed = applyRaidAction(current, state, action, { name: profile.username }, Date.now(), action === 'raid_claim' ? await rewardPolicy() : undefined); room = changed.room; after = changed.state;
      if (action === 'raid_claim') measurementReceipt = raidClaimMeasurementReceipt(state, after, current, room);
      if (action === 'raid_rescue') {
        const rescueEvent = raidRescueMissionEvent(room, user.id, requestId, Date.now());
        if (rescueEvent) after = recordMissionEvent(after, rescueEvent);
      }
      after = reconcileRaidMissionProgress(after, [room], Date.now());
    } else {
      after = applyGrowthAction(state, action, payload);
      const growthCounters = ['character_level', 'character_awaken', 'skill_level', 'equipment_level', 'equipment_lb'].includes(action) ? ['growth'] : [];
      if (action === 'character_unlock') growthCounters.push('soul_unlock');
      if (growthCounters.length) after = recordMissionEvent(after, { id: `growth:${requestId}`, at: Date.now(), counters: growthCounters });
    }
    const saved = await commit(state, after, requestId, null, room, version, measurementReceipt ?? gameplayMeasurementReceipt(action, state, after));
    return new Response(JSON.stringify(await responseFor(user.id, {}, saved.state)), { headers });
  } catch (error) {
    const conflict = error instanceof ApiError && error.status === 409;
    const message = conflict ? '他の操作で更新されました。再読み込みしてお試しください。' : error instanceof Error ? error.message : '処理に失敗しました。';
    return new Response(JSON.stringify({ error: message }), { status: error instanceof ApiError ? error.status : 400, headers });
  }
});
