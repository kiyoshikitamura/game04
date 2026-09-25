export type BgmScene = "TITLE" | "HOME" | "BATTLE_BOSS" | "BATTLE" | "GUILD" | "QUEST" | "PVP" | "RAID" | "GVG";

export type SeEvent =
  | "UI_TAP"
  | "UI_BACK"
  | "UI_MODAL_OPEN"
  | "UI_MODAL_CLOSE"
  | "GACHA_START"
  | "GACHA_REVEAL"
  | "GACHA_SR"
  | "GACHA_SSR"
  | "FORMATION_CONFIRM"
  | "GROWTH_START"
  | "LEVEL_UP"
  | "QUEST_START"
  | "QUEST_INSTANT"
  | "AWAKEN"
  | "BATTLE_IMPACT"
  | "BATTLE_IMPACT_ALL"
  | "BATTLE_HEAL"
  | "BATTLE_BURST"
  | "BATTLE_PHASE"
  | "BATTLE_START"
  | "BATTLE_ATTACK"
  | "BATTLE_SLASH"
  | "BATTLE_GUN"
  | "BATTLE_SKILL"
  | "BATTLE_DAMAGE"
  | "BATTLE_CRITICAL"
  | "BATTLE_WEAK"
  | "BATTLE_BUFF"
  | "BATTLE_DEBUFF"
  | "VICTORY"
  | "DEFEAT"
  | "REWARD"
  | "MISSION_COMPLETE"
  | "MISSION_REWARD"
  | "GUILD_JOIN";

export const AUDIO_DEFAULTS = {
  bgmEnabled: true,
  seEnabled: true,
  bgmVolume: 0.45,
  seVolume: 0.7,
} as const;

export const AUDIO_STORAGE_KEY = "tribe_neon_audio_settings_v1";

export const BGM_ASSETS: Record<BgmScene, string> = {
  TITLE: "/sounds/game04/bgm/title.mp3",
  HOME: "/sounds/game04/bgm/home.mp3",
  BATTLE: "/sounds/game04/bgm/battle.mp3",
  GUILD: "/sounds/game04/bgm/home.mp3",
  QUEST: "/sounds/game04/bgm/quest.mp3",
  PVP: "/sounds/game04/bgm/battle.mp3",
  RAID: "/sounds/game04/bgm/raid.mp3",
  GVG: "/sounds/game04/bgm/invasion.mp3",
  BATTLE_BOSS: "/sounds/game04/bgm/battle_boss.mp3",
};

export const SE_ASSETS: Record<SeEvent, string | null> = {
  AWAKEN: "/sounds/game04/se/awaken.mp3",
  BATTLE_PHASE: "/sounds/game04/se/awaken.mp3",
  BATTLE_IMPACT: "/sounds/game04/se/impact.mp3",
  BATTLE_IMPACT_ALL: "/sounds/game04/se/impact_all.mp3",
  BATTLE_HEAL: "/sounds/game04/se/heal.mp3",
  BATTLE_BURST: "/sounds/game04/se/burst.mp3",
  UI_TAP: "/sounds/se/se_ui_tap.mp3",
  UI_BACK: "/sounds/se/se_ui_cancel.mp3",
  UI_MODAL_OPEN: "/sounds/se/se_ui_confirm.mp3",
  UI_MODAL_CLOSE: "/sounds/se/se_ui_cancel.mp3",
  GACHA_START: "/sounds/se/se_gacha_start.mp3",
  GACHA_REVEAL: "/sounds/se/se_gacha_reveal.mp3",
  GACHA_SR: "/sounds/se/se_gacha_reveal.mp3",
  GACHA_SSR: "/sounds/se/se_gacha_ssr.mp3",
  FORMATION_CONFIRM: "/sounds/se/se_ui_confirm.mp3",
  GROWTH_START: "/sounds/se/se_power_up.mp3",
  LEVEL_UP: "/sounds/se/se_level_up.mp3",
  QUEST_START: "/sounds/se/se_ui_confirm.mp3",
  QUEST_INSTANT: "/sounds/se/se_ui_confirm.mp3",
  BATTLE_START: "/sounds/se/se_ui_confirm.mp3",
  BATTLE_ATTACK: "/sounds/game04/se/attack.mp3",
  BATTLE_SLASH: "/sounds/game04/se/slash.mp3",
  BATTLE_GUN: "/sounds/game04/se/projectile.mp3",
  BATTLE_SKILL: "/sounds/game04/se/skill.mp3",
  BATTLE_DAMAGE: null,
  BATTLE_CRITICAL: "/sounds/game04/se/critical.mp3",
  BATTLE_WEAK: null,
  BATTLE_BUFF: "/sounds/game04/se/buff.mp3",
  BATTLE_DEBUFF: "/sounds/game04/se/debuff.mp3",
  VICTORY: "/sounds/game04/se/victory.mp3",
  DEFEAT: "/sounds/game04/se/defeat.mp3",
  REWARD: "/sounds/se/se_reward_get.mp3",
  MISSION_COMPLETE: "/sounds/se/se_reward_get.mp3",
  MISSION_REWARD: "/sounds/se/se_reward_get.mp3",
  GUILD_JOIN: "/sounds/se/se_ui_confirm.mp3",
};

export const LEGACY_SE_EVENT_MAP: Record<string, SeEvent> = {
  click: "UI_TAP",

  attack: "BATTLE_ATTACK",
  hit: "BATTLE_DAMAGE",
  gacha: "GACHA_START",
};

export const SE_PRIORITY: Record<SeEvent, number> = {
  AWAKEN: 4, BATTLE_PHASE: 4, BATTLE_IMPACT: 2, BATTLE_IMPACT_ALL: 2, BATTLE_HEAL: 2, BATTLE_BURST: 4,
  VICTORY: 4,
  DEFEAT: 4,
  GACHA_SSR: 4,
  BATTLE_SKILL: 4,
  GACHA_SR: 3,
  BATTLE_CRITICAL: 3,
  BATTLE_WEAK: 3,
  BATTLE_BUFF: 2,
  BATTLE_DEBUFF: 2,
  LEVEL_UP: 3,
  REWARD: 3,
  MISSION_COMPLETE: 3,
  MISSION_REWARD: 3,
  GUILD_JOIN: 3,
  GACHA_START: 2,
  GACHA_REVEAL: 2,
  FORMATION_CONFIRM: 2,
  GROWTH_START: 2,
  QUEST_START: 2,
  QUEST_INSTANT: 2,
  BATTLE_START: 2,
  BATTLE_ATTACK: 2,
  BATTLE_SLASH: 2,
  BATTLE_GUN: 2,
  BATTLE_DAMAGE: 1,
  UI_TAP: 0,
  UI_BACK: 0,
  UI_MODAL_OPEN: 0,
  UI_MODAL_CLOSE: 0,
};

export const SE_COOLDOWN_MS: Partial<Record<SeEvent, number>> = {
  UI_TAP: 70,
  BATTLE_ATTACK: 90,
  BATTLE_DAMAGE: 110,
  BATTLE_CRITICAL: 160,
  BATTLE_WEAK: 160,
  BATTLE_BUFF: 160,
  BATTLE_DEBUFF: 160,
};
