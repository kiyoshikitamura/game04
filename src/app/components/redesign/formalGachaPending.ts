export type PendingGachaIntent = { id: string; key: string; action: "formal_gacha" | "formal_gacha_exchange"; payload: Record<string, unknown>; animate: boolean };
export type PendingIntentRead = { intent: PendingGachaIntent | null; unreadable: boolean };

// Only known pre-commit rejections may release an intent. Unknown/transport
// failures retain the request ID so a committed draw can never be charged twice.
export function isDefinitePrecommitFailure(message: string): boolean {
  if (/^(INVALID_GACHA_TICKET_COUNT|INVALID_GACHA_TICKET_CATEGORY|INVALID_GACHA_TICKET_OPERATION|INSUFFICIENT_RESOURCE|GACHA_DAY_CHANGED)$/.test(message.trim())) return true;
  return /不足|利用済み|不正|対象.*(ありません|ではありません)|交換ポイント|ガチャ券|無料10連|抽選条件/.test(message);
}

export const pendingStorageKey = (userId: string) => `game04:gacha-pending:${userId}`;
const isUuid = (value: unknown) => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export function readPendingIntent(userId: string, storage: Storage = localStorage): PendingIntentRead {
  try {
    const raw = storage.getItem(pendingStorageKey(userId));
    if (!raw) return { intent: null, unreadable: false };
    const value = JSON.parse(raw) as Partial<PendingGachaIntent>;
    if (!isUuid(value.id) || typeof value.key !== "string" || !["formal_gacha", "formal_gacha_exchange"].includes(String(value.action)) || !value.payload || typeof value.payload !== "object" || typeof value.animate !== "boolean") return { intent: null, unreadable: true };
    return { intent: value as PendingGachaIntent, unreadable: false };
  } catch { return { intent: null, unreadable: true }; }
}

export function savePendingIntent(userId: string, intent: PendingGachaIntent, storage: Storage = localStorage): boolean {
  try { storage.setItem(pendingStorageKey(userId), JSON.stringify(intent)); return true; }
  catch { return false; }
}

export function clearPendingIntent(userId: string, id?: string, storage: Storage = localStorage): boolean {
  try {
    const stored = readPendingIntent(userId, storage);
    if (stored.unreadable) return false;
    if (!stored.intent) return true;
    if (id && stored.intent.id !== id) return false;
    storage.removeItem(pendingStorageKey(userId));
    return true;
  } catch { return false; }
}
