import { CHARACTER_MASTERS } from './masters';
import { QUEST_AREAS, isQuestStageUnlocked } from './quests';
import type { RedesignState } from './types';

export type HomeBackground = {
  id: string;
  name: string;
  image: string;
  areaId?: string;
  conditionLabel: string;
};

/** Existing saved scenery remains available; area scenery shares the quest authority. */
export const HOME_BACKGROUNDS: HomeBackground[] = [
  { id: 'castle-approach', name: '夕桜の城門', image: '/bg/sengoku/castle-approach.jpg', conditionLabel: '' },
  { id: 'castle-town', name: '夕桜の城下町', image: '/bg/sengoku/castle-town.jpg', conditionLabel: '' },
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

export function isHomeBackgroundUnlocked(background: HomeBackground, clearedStages: readonly string[]): boolean {
  if (!background.areaId) return HOME_BACKGROUNDS.some(entry => entry.id === background.id && !entry.areaId);
  const area = QUEST_AREAS.find(entry => entry.id === background.areaId);
  return !!area?.stages[0] && isQuestStageUnlocked(area.stages[0].id, clearedStages);
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
    if (!isHomeBackgroundUnlocked(background, state.clearedStages)) throw new Error(background.conditionLabel);
  }
  return {
    ...state,
    ...(typeof payload.characterId === 'string' ? { homeCharacterId: payload.characterId } : {}),
    // Preserve supplied legacy IDs rather than migrating existing saves implicitly.
    ...(typeof payload.backgroundId === 'string' ? { homeBackgroundId: payload.backgroundId } : {}),
  };
}
