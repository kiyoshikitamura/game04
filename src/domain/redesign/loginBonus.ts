import type { Reward } from './types';

export const LOGIN_BONUS_VERSION = 'game04-login-30-v1-20260921';
export const LOGIN_BONUS_CHARACTER_ID = 'char_reiji_01'; // 織田信長。既存IDを維持。
export interface LoginBonusGrant {
  version: typeof LOGIN_BONUS_VERSION;
  day: number;
  rewards: Reward[];
  freeDiamonds: number;
}
/** Currency is a separate wallet credit, never mixed into an untyped inventory reward. */
export function loginBonusForDay(day: number): LoginBonusGrant {
  if (!Number.isSafeInteger(day) || day < 1 || day > 30) throw new Error('ログイン日数が不正です。');
  const rewards: Reward[] = [
    { kind: 'soul', id: LOGIN_BONUS_CHARACTER_ID, amount: 2 },
    { kind: 'cash', amount: 10000 },
  ];
  if ([3, 8, 13, 18, 23, 28].includes(day)) rewards.push(
    { kind: 'character_exp_item', id: 'large', amount: 1 },
    { kind: 'equipment_exp_item', id: 'large', amount: 2 },
  );
  if ([5, 20].includes(day)) rewards.push({ kind: 'ticket', id: 'SPECIAL_TICKET_CHARACTER', amount: 1 });
  if ([10, 25].includes(day)) rewards.push({ kind: 'ticket', id: 'SPECIAL_TICKET_SKILL', amount: 2 });
  if ([15, 30].includes(day)) rewards.push({ kind: 'ticket', id: 'SPECIAL_TICKET_EQUIPMENT', amount: 1 });
  return { version: LOGIN_BONUS_VERSION, day, rewards, freeDiamonds: [7, 14, 21].includes(day) ? 100 : 0 };
}
export function jstLoginDate(now: number): string {
  if (!Number.isFinite(now)) throw new Error('ログイン日時が不正です。');
  return new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
export interface LoginBonusProgress { version: typeof LOGIN_BONUS_VERSION; totalLogins: number; lastGrantedDate: string | null; }
/** Caller locks progress + wallet and persists grant and progress in one transaction. */
export function nextLoginBonus(progress: LoginBonusProgress, now: number): { progress: LoginBonusProgress; grant: LoginBonusGrant | null } {
  if (progress.version !== LOGIN_BONUS_VERSION || !Number.isSafeInteger(progress.totalLogins) || progress.totalLogins < 0) throw new Error('ログイン報酬の進行データが不正です。');
  const date = jstLoginDate(now);
  if (progress.lastGrantedDate && (!/^\d{4}-\d{2}-\d{2}$/.test(progress.lastGrantedDate) || progress.lastGrantedDate > date)) throw new Error('ログイン報酬の付与日時が不正です。');
  if (progress.lastGrantedDate === date) return { progress, grant: null };
  const day = progress.totalLogins % 30 + 1;
  return { progress: { ...progress, totalLogins: progress.totalLogins + 1, lastGrantedDate: date }, grant: loginBonusForDay(day) };
}
