/** GAME04 redesign contract. Numeric balance is preview-only until Economy FIX. */
export type Element = 'fire' | 'water' | 'earth' | 'wind' | 'light' | 'dark';
export type Rarity = 'N' | 'R' | 'SR' | 'SSR';
export type Stats = { hp: number; sp: number; atk: number; def: number; luk: number };
export type EquipmentSlot = 'weapon' | 'head' | 'body' | 'legs' | 'accessory1' | 'accessory2';
export type TargetRule = 'first' | 'lowest_hp' | 'highest_hp' | 'random' | 'all_enemies' | 'lowest_ally' | 'all_allies' | 'self' | 'dead_ally';
export type SkillCondition = { type: 'always' | 'hp_below' | 'ally_hp_below' | 'every_n_actions' | 'enemy_count' | 'ally_dead'; value?: number };
export type SkillEffect = { type: 'damage' | 'heal' | 'atk_up' | 'def_up' | 'atk_down' | 'def_down' | 'poison' | 'revive' | 'sp'; power: number; duration?: number; carryAcrossWaves?: boolean };
export interface SkillMaster { id: string; name: string; image: string; rarity: Rarity; element: Element; spCost: number; condition: SkillCondition; target: TargetRule; effects: SkillEffect[]; description: string }
export interface Passive { level?: number; id: string; name: string; stat: keyof Stats; percent: number; target: 'party' | 'self'; }
export interface CharacterMaster { id: string; name: string; image: string; rarity: Rarity; element: Element; role: string; stats: Stats; passive: Passive; }
export interface EquipmentMaster { id: string; name: string; image: string; rarity: Rarity; slot: EquipmentSlot; stats: Stats; }
export interface OwnedCharacter { id: string; level: number; awakening: number; }
export interface OwnedSkill { id: string; level: number; }
export interface OwnedEquipment { instanceId: string; masterId: string; level: number; lb: number; locked?: boolean; }
export interface DeckMember { characterId: string; skillIds: string[]; equipment: Partial<Record<EquipmentSlot, string>>; }
export interface BattleUnit { id: string; name: string; image: string; level: number; element: Element; stats: Stats; skills: SkillMaster[]; passives: Passive[]; deathEffects?: SkillEffect[]; }
export interface EnemyPhase { hpBelow: number; name: string; image?: string; actionCount?: number; skills?: SkillMaster[]; }
export interface EnemyUnit extends BattleUnit { actionCount: number; order: number; boss?: boolean; phases?: EnemyPhase[]; }
export interface BattleRules { defenseFactor: number; advantageMultiplier: number; disadvantageMultiplier: number; spRecoveryDivisor: number; burstLukDivisor: number; enemySpRecoveryDivisor: number; maxPlayerActions: number; initialSpRatio: number; }
export interface BattleInput { seed: number; party: BattleUnit[]; waves: EnemyUnit[][]; rules: BattleRules; }
export interface Reward { kind: 'character' | 'skill' | 'cash' | 'character_material' | 'skill_material' | 'equipment_material' | 'equipment_lb' | 'soul' | 'equipment' | 'unlock_item'; amount: number; id?: string; chance?: number; }
export interface QuestStage { id: string; areaId: string; index: number; name: string; description: string; energyCost: number; waves: EnemyUnit[][]; firstRewards: Reward[]; rewards: Reward[]; rareRewards: Reward[]; encounterChance: number; }
export interface QuestArea { id: string; index: number; name: string; description: string; image: string; stages: QuestStage[]; }
export interface RedesignState { territoryItems?: Record<string, number>; claimedMissionIds?: string[]; legacyImportedIds?: string[]; homeCharacterId?: string; homeBackgroundId?: string; userId: string; souls: Record<string, number>; version: number; cash: number; diamonds: number; energy: number; energyMax: number; characters: OwnedCharacter[]; skills: OwnedSkill[]; equipment: OwnedEquipment[]; deck: DeckMember[]; materials: { character: number; skill: number; equipment: number; equipmentLb: number; unlock: number }; clearedStages: string[]; vipExpiresAt: string | null; }
export interface RaidMaster { id: string; name: string; type: 'encounter' | 'unlock'; enemy: EnemyUnit; energyCost: number; durationMinutes: number; maxParticipants: number; maxLevel: number; appearanceLevels: number[]; appearanceImages: Record<string, string>; enemyGrowthPerLevel: number; sharedHpGrowthPerLevel: number; victoryMultiplier: number; sharedHp: number; participationRewards: Reward[]; defeatRewards: Reward[]; }
export interface RaidParticipant { userId: string; name: string; wins: number; attempts: number; totalDamage: number; joinedLevel: number; leftAt?: string; lastResult?: string; }
export interface RaidRoom { territorySnapshot?: TerritorySnapshot; id: string; masterId: string; ownerId: string; level: number; hp: number; maxHp: number; expiresAt: string; createdAt: string; status: 'active' | 'defeated' | 'expired'; rescueCount: number; rescueWindowStartedAt: string; participants: RaidParticipant[]; settledBattleIds: string[]; rewardGrants: { id: string; userId: string; level: number; rewards: Reward[]; claimed: boolean }[]; }

export type TerritoryMasterStatus = 'PREVIEW_PROVISIONAL' | 'APPROVED';
export interface TerritoryLevel { level: number; requiredExp: number; hostingSlots: number; }
export interface TerritoryDestination { id: string; name: string; castle: string; difficulty: string; itemSource: string; raidMasterId: string; requiredLevel: number; itemName: string; itemId: string; itemCount: number; durationMinutes: number; clearExp: number; }
export interface TerritoryMaster { version: string; status: TerritoryMasterStatus; initialExp: number; legacyMigrationExp: number; levelCap: number; levels: TerritoryLevel[]; destinations: TerritoryDestination[]; raidMasters: RaidMaster[]; battleRules: BattleRules; }
export interface TerritoryProgress { experience: number; }
export interface TerritorySnapshot { masterVersion: string; status: TerritoryMasterStatus; destination: TerritoryDestination; raidMaster: RaidMaster; battleRules: BattleRules; }
export interface TerritoryDestinationProjection extends TerritoryDestination { raidMaster: RaidMaster; ownedItemCount: number; canHost: boolean; reasons: string[]; }
export interface TerritoryProjection { masterVersion: string; status: TerritoryMasterStatus; experience: number; level: number; nextLevelExp: number | null; hostingSlots: number; activeHostingCount: number; destinations: TerritoryDestinationProjection[]; }
