import fs from 'node:fs';import assert from 'node:assert/strict';import {api} from './raid-work-live.mjs';
const dir='/tmp/game04-work-live',owner=JSON.parse(fs.readFileSync(dir+'/owner.json')),guest=JSON.parse(fs.readFileSync(dir+'/guest.json')),rooms=JSON.parse(fs.readFileSync(dir+'/boundary.json'));
const id=kind=>rooms.find(r=>r.kind===kind).id,checks=[];
const call=async(who,action,payload={},requestId)=>{const r=await api(who,action,payload,requestId);return r;};
for(const kind of ['expired','full']){const r=await call(guest,'raid_join',{roomId:id(kind)});assert.equal(r.status,400);checks.push({case:kind,pass:true,error:r.data.error});}
assert.equal((await call(guest,'raid_join',{roomId:id('leave')})).status,200);assert.equal((await call(guest,'raid_leave',{roomId:id('leave')})).status,200);
for(const action of ['raid_join','raid_battle']){const r=await call(guest,action,{roomId:id('leave')});assert.equal(r.status,400);checks.push({case:'left:'+action,pass:true,error:r.data.error});}
assert.equal((await call(owner,'raid_battle',{roomId:id('energy')})).status,200);const shortage=await call(owner,'raid_battle',{roomId:id('energy')});assert.equal(shortage.status,400);assert.match(shortage.data.error,/行動力/);checks.push({case:'energy shortage',pass:true,error:shortage.data.error});
const req=crypto.randomUUID(),payload={destinationId:'azuchi'},host=await call(guest,'territory_host',payload,req);assert.equal(host.status,200,JSON.stringify(host));const roomId=host.data.territoryRoomId,room=host.data.rooms.find(r=>r.id===roomId);assert.equal(room.territorySnapshot.raidMaster.stages.length,12);assert.equal(room.masterId,'TI05');
const twice=await call(guest,'territory_host',payload,req);assert.equal(twice.data.territoryRoomId,roomId);assert.equal(twice.data.state.materials.unlock,host.data.state.materials.unlock);checks.push({case:'formal 12-stage hosting and same-request replay',pass:true,roomId});
const limit=await call(guest,'territory_host',payload);assert.equal(limit.status,400);checks.push({case:'host capacity',pass:true,error:limit.data.error});
fs.writeFileSync('docs/verification/raid-20260923/live-boundary-results.json',JSON.stringify({pass:true,scope:'Real dev API; disposable room initial states for expired/full, formal enemy masters unchanged',checks},null,2));console.log(JSON.stringify(checks));
