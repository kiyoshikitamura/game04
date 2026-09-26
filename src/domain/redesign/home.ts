import { CHARACTER_MASTERS } from './masters';
import { SSR_HOME_BACKGROUNDS } from './approvedBackgrounds';
import { QUEST_AREAS, isQuestStageUnlocked } from './quests';
import type { RedesignState } from './types';

export type HomeBackground = {
  id: string;
  name: string;
  image: string;
  areaId?: string;
  characterId?: string;
  conditionLabel: string;
};

/** Existing saved scenery remains available; area scenery shares the quest authority. */
export const HOME_BACKGROUNDS: HomeBackground[] = [
  { id: 'castle-approach', name: '夕桜の城門', image: '/bg/sengoku/castle-approach.jpg', conditionLabel: '' },
  { id: 'castle-town', name: '夕桜の城下町', image: '/bg/sengoku/castle-town.jpg', conditionLabel: '' },
  ...SSR_HOME_BACKGROUNDS.map(background => ({
    ...background, conditionLabel: `${background.characterName}の入手で選択可能`,
  })),
  ...QUEST_AREAS.map(area => ({
    id: `area:${area.id}`, name: area.name, image: area.image, areaId: area.id,
    conditionLabel: `出陣「${area.name}」解放で選択可能`,
  })),
];

const LEGACY_BACKGROUND_IDS: Record<string, string> = {
  bg_default: 'castle-approach', bg_kabukicho: 'castle-town',
};

function findHomeBackground(id: string | undefined): HomeBackground | undefined {
  return HOME_BACKGROUNDS.find(background => background.id === (id ? LEGACY_BACKGROUND_IDS[id] ?? id : undefined));
}

export function resolveHomeBackground(id?: string): HomeBackground {
  return findHomeBackground(id) ?? HOME_BACKGROUNDS[0];
}

/** Append once after acquisition or an existing-owner read; never select a background implicitly. */
export function synchronizeHomeBackgroundUnlocks(state: RedesignState): RedesignState {
  const owned = new Set(state.characters.map(character => character.id));
  const unlocked = new Set(state.unlockedHomeBackgroundIds ?? []);
  const additions = SSR_HOME_BACKGROUNDS.filter(background => owned.has(background.characterId)
    && CHARACTER_MASTERS.some(character => character.id === background.characterId && character.rarity === 'SSR')
    && !unlocked.has(background.id)).map(background => background.id);
  if (!additions.length) return state;
  return { ...state, unlockedHomeBackgroundIds: [...unlocked, ...additions] };
}

export function isHomeBackgroundUnlocked(background: HomeBackground, clearedStages: readonly string[], unlockedIds: readonly string[] = [], progress?: RedesignState['earlyProgress']): boolean {
  const registered = findHomeBackground(background.id);
  if (!registered) return false;
  if (registered.characterId) return unlockedIds.includes(registered.id);
  if (!registered.areaId) return true;
  const area = QUEST_AREAS.find(entry => entry.id === registered.areaId);
  return !!area?.stages[0] && isQuestStageUnlocked(area.stages[0].id, clearedStages,progress);
}

/** Validate the complete draft before cloning so a rejected background cannot partially save a character. */
export function applyHomeSelection(state: RedesignState, payload: Record<string, unknown>): RedesignState {
  if (payload.characterId !== undefined && (typeof payload.characterId !== 'string'
    || !state.characters.some(character => character.id === payload.characterId)
    || !CHARACTER_MASTERS.some(character => character.id === payload.characterId))) {
    throw new Error('未所持の武将です。');
  }
  if (payload.backgroundId !== undefined) {
    if (typeof payload.backgroundId !== 'string') throw new Error('背景が不正です。');
    const background = findHomeBackground(payload.backgroundId);
    if (!background) throw new Error('背景が不正です。');
    if (!isHomeBackgroundUnlocked(background, state.clearedStages, state.unlockedHomeBackgroundIds,state.earlyProgress)) throw new Error(background.conditionLabel);
  }
  return {
    ...state,
    ...(typeof payload.characterId === 'string' ? { homeCharacterId: payload.characterId } : {}),
    // Preserve supplied legacy IDs rather than migrating existing saves implicitly.
    ...(typeof payload.backgroundId === 'string' ? { homeBackgroundId: payload.backgroundId } : {}),
  };
}
