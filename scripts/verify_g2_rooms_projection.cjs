const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const base='docs/verification/g2-20260925/r7/shared-api/';
function extract(file){const s=fs.readFileSync(base+file,'utf8');const rpc=s.indexOf('"game04_raid_rooms_');const start=s.lastIndexOf('async function ',rpc),end=s.indexOf('\nasync function ',rpc);const body=s.slice(start,end);const name=body.match(/async function (\w+)/)[1];return body+`;globalThis.projection=${name};`;}
const old=extract(process.env.G2_ROOMS_BASE||'live-v29-original.ts.txt'),next=extract(process.env.G2_ROOMS_CANDIDATE||'live-v29-rooms.ts.txt');
const fixtures=[[],[
 {state:{ownerId:'owner',status:'active',expiresAt:'2000-01-01',participants:[{userId:'owner',name:'old',portraitUrl:'old.png'},{userId:'other',name:'Other',portraitUrl:'other.png'}]},version:2},
 {state:{ownerId:'missing',status:'active',expiresAt:'2100-01-01',participants:[{userId:'missing',name:'Fallback',portraitUrl:'old.png'}]},version:3},
 {state:{ownerId:'unknown',status:'finished',expiresAt:'2100-01-01',participants:[{userId:'unknown',name:'Unknown'}]},version:4}
]];
const profiles=[{id:'owner',username:'Current'},{id:'unknown',username:''}],players=[{user_id:'owner',state:{deck:[{characterId:'valid'}]}},{user_id:'unknown',state:{deck:[{characterId:'not-in-master'}]}}];
async function project(code,rows){const calls=[];const context={Date,Set,De:[{id:'valid'}],iu:c=>`portrait:${c.id}`,
 Ae:async(name,args)=>{calls.push(name);assert.equal(args.p_user_id,'viewer');return name==='game04_raid_rooms_for_user'?rows:rows.map(r=>({...r,ownerName:profiles.find(p=>p.id===r.state.ownerId)?.username??null,ownerLeaderCharacterId:players.find(p=>p.user_id===r.state.ownerId)?.state.deck[0].characterId??null}));},
 me:async path=>{calls.push(path);return path.startsWith('users?')?profiles:players;}};
 context._e=context.me;context.su=context.iu;vm.runInNewContext(code,context);return {result:JSON.parse(JSON.stringify(await context.projection('viewer'))),calls};}
(async()=>{for(const rows of fixtures){const a=await project(old,rows),b=await project(next,rows);assert.deepEqual(b.result,a.result);assert.equal(b.calls.length,1);assert.equal(a.calls.length,rows.length?3:1);}console.log('PASS old/new owner projection: room order/version, empty, owner missing, empty name, missing leader master, participant preservation, expiry; new one RPC.');})().catch(e=>{console.error(e);process.exitCode=1;});
