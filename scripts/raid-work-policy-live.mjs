import fs from 'node:fs';import assert from 'node:assert/strict';import {api} from './raid-work-live.mjs';
const A=JSON.parse(fs.readFileSync('/tmp/game04-work-live/RQAPolA.json'));const B=JSON.parse(fs.readFileSync('/tmp/game04-work-live/RQAPolB.json'));
const checks=[];const call=async(s,a,p={},r)=>api(s,a,p,r);
if(process.argv.includes('--locked')){
for(const s of [A,B]){const r=await call(s,'get_state');assert.equal(r.status,200);assert.equal(r.data.territory.unlocked,false);assert.equal(r.data.territory.destinations.length,5);assert.ok(r.data.territory.destinations.every(d=>!d.canHost));}
const r=await call(A,'territory_host',{destinationId:'TI01'});assert.equal(r.status,400);assert.match(r.data.error,/3-5/);console.log('PASS locked state and host rejection');
}else{
let r=await call(A,'get_state');assert.equal(r.status,200);assert.equal(r.data.territory.unlocked,true);assert.equal(r.data.territory.level,1);assert.equal(r.data.state.materials.unlock,2);assert.equal(r.data.territory.destinations.filter(d=>d.canHost).length,1);checks.push('3-5 unlock; only Okazaki open; one order granted');
const deny=await call(A,'territory_host',{destinationId:'TI05'});assert.equal(deny.status,400);checks.push('Azuchi host level gate');
const req=crypto.randomUUID();r=await call(A,'territory_host',{destinationId:'TI01'},req);assert.equal(r.status,200,JSON.stringify(r.data));const roomId=r.data.territoryRoomId;const room=r.data.rooms.find(x=>x.id===roomId);assert.equal(room.territorySnapshot.destination.clearExp,100);assert.equal(room.territorySnapshot.raidMaster.stages.length,12);assert.equal(r.data.state.materials.unlock,1);
const again=await call(A,'territory_host',{destinationId:'TI01'},req);assert.equal(again.status,200);assert.equal(again.data.territoryRoomId,roomId);assert.equal(again.data.state.materials.unlock,1);checks.push('12-stage host snapshot; order consumed once; request replay');
const join=await call(B,'raid_join',{roomId});assert.equal(join.status,400);assert.match(join.data.error,/3-5/);checks.push('locked rescuer cannot join');
const cap=await call(A,'territory_host',{destinationId:'TI01'});assert.equal(cap.status,400);checks.push('one host slot');
fs.writeFileSync('docs/verification/raid-20260923/host-policy-live.json',JSON.stringify({apiVersion:15,pass:true,roomId,checks},null,2));console.log(JSON.stringify({pass:true,roomId,checks}));
}
