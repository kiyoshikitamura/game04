import { createInitialState, grantReward } from '../masters';
import { jstLoginDate, loginBonusForDay } from '../loginBonus';
import type { RedesignState } from '../types';
import { SCENES, STARTERS, STARTER_SKILLS, TUTORIAL_VERSION } from './content';

/** Separate preview save. Never imported into the normal player wallet/inventory. */
export interface TutorialSave {
  schema: typeof TUTORIAL_VERSION;
  revision: number;
  step: number;
  name: string;
  game: RedesignState;
  homeVisits: number;
  departed: boolean;
  defeatSeen: boolean;
  defeatPending: boolean;
  loginDate: string | null;
  loginDays: number;
  loginPending: boolean;
  receipts: string[];
}
export function newTutorial(userId: string): TutorialSave {
  const game = createInitialState(userId);
  // No legacy starter grants. Preview energy is provisioned solely for follow-up verification.
  Object.assign(game, { characters: [], skills: [], deck: [], equipment: [], energy: 100,
    materials: { character: 0, skill: 0, equipment: 0, equipmentLb: 0, unlock: 0 } });
  return { schema: TUTORIAL_VERSION, revision: 0, step: 0, name: '', game,
    homeVisits: 0, departed: false, defeatSeen: false, defeatPending: false,
    loginDate: null, loginDays: 0, loginPending: false, receipts: [] };
}
export type TutorialAction =
  | { type: 'next'; step: number; name?: string }
  | { type: 'home'; now: number }
  | { type: 'depart' }
  | { type: 'defeat' }
  | { type: 'dismiss-defeat' }
  | { type: 'dismiss-login' }
  | { type: 'game'; game: RedesignState };

export function advanceTutorial(previous: TutorialSave, action: TutorialAction, receipt: string): TutorialSave {
  if (previous.receipts.includes(receipt)) return previous;
  const next = structuredClone(previous);
  if (action.type === 'next') {
    if (next.step !== action.step || next.step >= SCENES.length) return previous;
    const scene = SCENES[next.step].id;
    if (scene === 'name') {
      const name = action.name?.trim() ?? '';
      if (!name || [...name].length > 8 || /[\p{Cc}\p{Cf}]/u.test(name)) throw new Error('名前は1〜8文字で入力してください。');
      next.name = name;
    }
    next.step++;
    const entering = SCENES[next.step]?.id;
    if (entering === 'characters') next.game.characters = STARTERS.map(id => ({ id, level: 1, awakening: 0, exp: 0 }));
    if (entering === 'skills') next.game.skills = STARTER_SKILLS.map(id => ({ id, level: 0 }));
    if (entering === 'equipped') next.game.deck = STARTERS.map((characterId, i) => ({ characterId, skillIds: [STARTER_SKILLS[i]], equipment: {} }));
  } else {
    if (next.step < SCENES.length) throw new Error('チュートリアルが完了していません。');
    if (action.type === 'home') {
      next.homeVisits++;
      // Suppress the first visit; display and grant atomically starting with the second.
      const date = jstLoginDate(action.now);
      if (next.homeVisits >= 2 && next.loginDate !== date) {
        const grant = loginBonusForDay(next.loginDays % 30 + 1);
        grant.rewards.forEach((reward, i) => { next.game = grantReward(next.game, reward, `tutorial-login:${date}:${i}`); });
        next.game.diamonds += grant.freeDiamonds;
        next.loginDate = date; next.loginDays++; next.loginPending = true;
      }
    }
    if (action.type === 'depart') next.departed = true;
    if (action.type === 'defeat' && !next.defeatSeen) { next.defeatSeen = true; next.defeatPending = true; }
    if (action.type === 'dismiss-defeat') next.defeatPending = false;
    if (action.type === 'dismiss-login') next.loginPending = false;
    if (action.type === 'game') next.game = action.game;
  }
  next.revision++;
  next.receipts = [...next.receipts, receipt].slice(-100);
  return next;
}

