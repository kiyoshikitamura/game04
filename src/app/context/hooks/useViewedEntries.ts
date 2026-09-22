"use client";
import { useCallback, useEffect, useState } from 'react';
export type ViewedEntry = { id: string | number; revision: string };
function read(key: string): Record<string, string> {
  try { const value = JSON.parse(localStorage.getItem(key) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch { return {}; }
}
/** Device/account scoped view receipts, separate from reward claim status. */
export function useViewedEntries(userId: string | undefined, category: string, entries: ViewedEntry[]) {
  const key = userId ? `game04:viewed:${category}:${userId}` : '';
  const [state, setState] = useState<{ key: string; seen: Record<string, string> }>({ key: '', seen: {} });
  useEffect(() => {
    if (!key) return;
    const sync = () => setState({ key, seen: read(key) }); sync();
    const storage = (event: StorageEvent) => { if (!event.key || event.key === key) sync(); };
    window.addEventListener('storage', storage); return () => window.removeEventListener('storage', storage);
  }, [key]);
  const isUnread = useCallback((entry: ViewedEntry) => !!key && state.key === key && state.seen[String(entry.id)] !== entry.revision, [key, state]);
  const markViewed = useCallback((entry: ViewedEntry) => {
    if (!key) return;
    setState(current => {
      const seen = { ...(current.key === key ? current.seen : {}), ...read(key), [String(entry.id)]: entry.revision };
      try { localStorage.setItem(key, JSON.stringify(seen)); } catch { /* Retain current-session state when storage is unavailable. */ }
      return { key, seen };
    });
  }, [key]);
  return { isUnread, markViewed, unreadCount: entries.filter(isUnread).length };
}
export const presentViewEntry = (item: { id: string | number; created_at?: string; title?: string; message?: string; item_id?: string; itemId?: string; quantity?: number; qty?: number }): ViewedEntry => ({
  id: item.id, revision: JSON.stringify([item.created_at, item.title || item.message, item.item_id || item.itemId, item.quantity ?? item.qty]),
});
