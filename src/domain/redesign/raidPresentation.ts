import type { Element, Reward } from './types';

export const raidElementLabels: Record<Element, string> = { fire: '火', water: '水', earth: '土', wind: '風', light: '光', dark: '闇' };
export function raidTimeRemaining(expiresAt: string, now: number): string {
  const seconds = Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));
  if (!Number.isFinite(seconds) || seconds === 0) return '終了';
  if (seconds >= 86400) return `${Math.floor(seconds / 86400)}日 ${Math.floor(seconds % 86400 / 3600)}時間`;
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}時間 ${Math.floor(seconds % 3600 / 60)}分`;
  return `${Math.floor(seconds / 60)}分 ${seconds % 60}秒`;
}
export function raidRewardLabel(reward: Reward): string {
  const labels: Record<Reward['kind'], string> = {character:'武将',skill:'スキル',cash:'銭',character_material:'武将育成素材',skill_material:'スキルLB素材',equipment_material:'装備育成素材',equipment_lb:'装備LB素材',soul:'武将の魂',equipment:'装備',unlock_item:'領土侵攻札'};
  return `${labels[reward.kind]} ×${reward.amount.toLocaleString()}`;
}
/** Display only. Server enforces windows atomically; a client clock never grants rescue rights. */
export function raidRescueWindow(type: 'encounter' | 'unlock', count: number, startedAt: string, now: number) {
  const resetsAt = Date.parse(startedAt) + 6 * 3600_000;
  return { remaining: type === 'unlock' && now >= resetsAt ? 3 : Math.max(0, 3 - count), resetsAt: type === 'unlock' ? new Date(resetsAt).toISOString() : null };
}
