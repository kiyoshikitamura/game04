"use client";
import { useLayoutEffect } from 'react';
const listeners = new Set<() => void>();
const tasks = new Map<symbol, { error?: boolean; retry?: () => void }>();
let revision = 0;
const publish = () => { revision++; listeners.forEach(fn => fn()); };
export const subscribePresentation = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const presentationSnapshot = () => revision;
export const presentationTasks = () => [...tasks.values()];
export const isPresentationBusy = () => tasks.size > 0;
export function beginPresentation() {
  const id = Symbol(); tasks.set(id, {}); publish();
  return { end: () => { if (tasks.delete(id)) publish(); }, fail: (retry: () => void) => { if(tasks.has(id)) {tasks.set(id, {error:true,retry});publish();} } };
}
export async function withPresentation<T>(action: () => Promise<T>): Promise<T> {
  const task = beginPresentation();
  try { return await action(); } finally { task.end(); }
}
export function usePresentationBusy(busy: boolean) {
  useLayoutEffect(() => { if (!busy) return; const task = beginPresentation(); return task.end; }, [busy]);
}
