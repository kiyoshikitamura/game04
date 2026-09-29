import assert from 'node:assert/strict';
import { onlinePresentation, validOnline } from '../src/utils/titleOnline.ts';
for (const [count, text] of [[29,''],[30,'現在30人以上がプレイ中'],[39,'現在30人以上がプレイ中'],[40,'現在40人以上がプレイ中'],[99,'現在90人以上がプレイ中'],[100,'現在100人がプレイ中'],[127,'現在127人がプレイ中']]) {
  assert.equal(onlinePresentation(count).text,text);
  assert.equal(onlinePresentation(count).visible,count>=30);
  console.log(`${count}: ${text || '非表示'} PASS`);
}
for (const count of [null,-1,NaN,Infinity,30.5]) assert.equal(onlinePresentation(count).visible,false);
assert.equal(onlinePresentation(null).range,'unknown');
assert.equal(onlinePresentation(0).range,'<30');
assert.equal(validOnline({count:127,countedAt:new Date().toISOString()}),true);
assert.equal(validOnline({count:127,countedAt:new Date(Date.now()-360001).toISOString()}),false);
assert.equal(validOnline({count:127,countedAt:'invalid'}),false);
console.log('Failure/invalid/stale counts fail closed: PASS');
