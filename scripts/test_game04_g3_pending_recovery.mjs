import assert from 'node:assert/strict';
import { clearPendingIntent, pendingStorageKey, readPendingIntent, savePendingIntent } from '../src/app/components/redesign/formalGachaPending.ts';

class MemoryStorage {
  #values = new Map();
  get length() { return this.#values.size; }
  clear() { this.#values.clear(); }
  getItem(key) { return this.#values.has(key) ? this.#values.get(key) : null; }
  key(index) { return [...this.#values.keys()][index] ?? null; }
  removeItem(key) { this.#values.delete(key); }
  setItem(key, value) { this.#values.set(key, String(value)); }
}

const storage = new MemoryStorage();
const intent = {
  id: '11111111-1111-4111-8111-111111111111',
  key: 'draw:{"mode":"normal","count":10,"payment":"FREE"}',
  action: 'formal_gacha',
  payload: { mode: 'normal', count: 10, payment: 'FREE' },
  animate: true,
};

// User switching must not expose or replay another owner's request.
assert.equal(savePendingIntent('user-a', intent, storage), true);
assert.deepEqual(readPendingIntent('user-a', storage).intent, intent);
assert.equal(readPendingIntent('user-b', storage).intent, null);
assert.notEqual(pendingStorageKey('user-a'), pendingStorageKey('user-b'));

// Another tab may acknowledge and remove the same result first; close remains successful.
storage.removeItem(pendingStorageKey('user-a'));
assert.equal(clearPendingIntent('user-a', intent.id, storage), true);

// A catalog failure must not discard pending metadata. The retry reuses the saved ID.
assert.equal(savePendingIntent('user-a', intent, storage), true);
let catalogAttempts = 0;
const loadCatalog = async () => {
  catalogAttempts += 1;
  if (catalogAttempts === 1) throw new Error('offline');
  return { available: true };
};
await assert.rejects(loadCatalog(), /offline/);
assert.deepEqual(readPendingIntent('user-a', storage).intent, intent);
await loadCatalog();
const replayed = [];
const recovered = readPendingIntent('user-a', storage).intent;
replayed.push({ action: recovered.action, payload: recovered.payload, requestId: recovered.id });
assert.deepEqual(replayed, [{ action: intent.action, payload: intent.payload, requestId: intent.id }]);

// Corrupt/unknown state fails closed and is not deleted automatically.
storage.setItem(pendingStorageKey('user-a'), '{broken');
assert.equal(readPendingIntent('user-a', storage).unreadable, true);
assert.equal(storage.getItem(pendingStorageKey('user-a')), '{broken');

console.log('PASS G3 pending recovery: user isolation, other-tab ack, catalog retry replay, fail-closed unreadable state.');
