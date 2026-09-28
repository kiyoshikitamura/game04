export type PendingGachaIntent = { id: string; key: string; action: "formal_gacha" | "formal_gacha_exchange"; payload: Record<string, unknown>; animate: boolean };
export type PendingIntentRead = { intent: PendingGachaIntent | null; unreadable: boolean };

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
