import assert from 'node:assert/strict';
import { isDefinitePrecommitFailure, savePendingIntent, readPendingIntent, clearPendingIntent, type PendingGachaIntent } from '../src/app/components/redesign/formalGachaPending';
const data = new Map<string,string>();
const storage = { getItem:(k:string)=>data.get(k)??null, setItem:(k:string,v:string)=>data.set(k,v), removeItem:(k:string)=>data.delete(k) } as unknown as Storage;
const intent: PendingGachaIntent = {id:'00000000-0000-4000-8000-000000000001',key:'ticket10',action:'formal_gacha',payload:{mode:'special',category:'character',count:10,payment:'TICKET'},animate:true};
for (const message of ['INVALID_GACHA_TICKET_COUNT','INVALID_GACHA_TICKET_CATEGORY','INVALID_GACHA_TICKET_OPERATION','INSUFFICIENT_RESOURCE','GACHA_DAY_CHANGED','輝石が不足しています。']) {
  assert.ok(savePendingIntent('qa',intent,storage));
  assert.ok(isDefinitePrecommitFailure(message));
  assert.ok(clearPendingIntent('qa',readPendingIntent('qa',storage).intent!.id,storage));
  assert.equal(readPendingIntent('qa',storage).intent,null);
  for (const key of ['normal','character','skill','equipment','exchange']) {
    assert.ok(savePendingIntent('qa',{...intent,key},storage));
    assert.equal(readPendingIntent('qa',storage).intent!.key,key);
    assert.ok(clearPendingIntent('qa',intent.id,storage));
  }
}
for (const message of ['Failed to fetch','接続を確認できませんでした。もう一度お試しください。','獲得結果を確認できませんでした。','STATE_CONFLICT','REQUEST_ID_REUSED','INTERNAL_SERVER_ERROR']) {
  savePendingIntent('qa',intent,storage);
  assert.equal(isDefinitePrecommitFailure(message),false);
  assert.equal(readPendingIntent('qa',storage).intent!.id,intent.id);
}
assert.equal(clearPendingIntent('qa','00000000-0000-4000-8000-000000000002',storage),false);
assert.equal(readPendingIntent('qa',storage).intent!.id,intent.id);
console.log('PASS definite rejection releases all gacha choices; uncertain outcomes and other requests remain protected');
