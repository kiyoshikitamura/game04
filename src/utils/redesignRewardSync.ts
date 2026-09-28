/** Read-only invalidation: only the server grants assets. */
export const REDESIGN_REWARD_SYNC_EVENT = 'game04:reward-state-changed';
export function notifyRedesignRewardChange(userId: string) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(REDESIGN_REWARD_SYNC_EVENT, { detail: { userId } }));
}
