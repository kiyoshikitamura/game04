/** Existing server chat/DM limits; code points match PostgreSQL char_length. */
export const COMMUNITY_MESSAGE_MAX_LENGTH = 140;
export function validCommunityMessage(value: string) {
  const length = Array.from(value.trim()).length;
  return length > 0 && length <= COMMUNITY_MESSAGE_MAX_LENGTH;
}

export type CommunityProfile = {
  user_id: string; username: string; bio?: string; favorite_character_id?: string;
  authenticated?: boolean; vip_expires_at?: string | null;
};
export const COMMUNITY_ACTIVITY_TYPES = new Set([
  'SYSTEM_NEWS', 'SSR_CHARACTER', 'SSR_SKILL', 'SSR_EQUIPMENT', 'RAID_HELP_REQUEST', 'RAID_BOSS_DEFEATED',
]);
export function uniqueCommunityRows<T extends { id: string }>(rows: readonly T[]): T[] {
  return [...new Map(rows.map(row => [row.id, row])).values()];
}
/** Resolve the optimistic RPC/Realtime race without collapsing distinct messages. */
export function settleCommunityMessage<T extends { id: string }>(rows: readonly T[], temporaryId: string, saved: T): T[] {
  return uniqueCommunityRows([...rows.filter(row => row.id !== temporaryId && row.id !== saved.id), saved]);
}
export function authenticationReminderKey(userId: string) {
  // Retain the inherited per-player daily suppression, including prior records.
  return `tribe_account_authentication_reminder:${userId}`;
}
