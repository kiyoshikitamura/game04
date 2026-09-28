const fs=require('fs'),assert=require('assert/strict'),ts=require('typescript'),Module=require('module'),path=require('path');
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
require.extensions['.ts']=(m,f)=>m._compile(compile(fs.readFileSync(f,'utf8')),f);
const {burstPresentation,battleLeadIn}=require('../src/domain/presentation/battleLeadIn.ts');
const source=fs.readFileSync('src/domain/redesign/battleBalanceV2.ts','utf8'),engine=path.resolve('src/domain/redesign/battleBalanceV2.ts');
function simulate(seed,setup=()=>{}){const input=structuredClone(JSON.parse(fs.readFileSync('docs/verification/device-debug/b05/usable.json')).input);input.seed=seed;input.rules.burstPolicy='attack-free-enemy-pause-v2-20260927';setup(input);const m=new Module(engine,module);m.filename=engine;m.paths=module.paths;m._compile(compile(source.replace('let partySp = 0, gauge = 0,','let partySp = 0, gauge = 200,')),engine);return m.exports.simulateBalanceBattle(input);}
let success,failure;for(let seed=1;seed<100&&(!success||!failure);seed++){const r=simulate(seed);if(r.frames[1].event==='burst_start')success=r;if(r.frames[1].event==='burst_failed')failure=r;}
assert(success&&failure);
for(const r of [success,failure]){
  assert.equal(r.frames[0].burstGauge,200);assert.equal(r.frames[1].burstGauge,0);assert.equal(r.frames[1].gaugeDelta,-200);
  for(let i=1;i<r.frames.length;i++)if(r.frames[i-1].burstGauge===200&&r.frames[i].burstGauge===0)assert(['burst_start','burst_failed'].includes(r.frames[i].event),'only a roll consumes the full gauge');
}
assert.equal(failure.frames[1].reason,'burst_roll_failed_consumed');
assert(!failure.frames[1].burst);assert.equal(burstPresentation(failure,1).count,0);
const blocked=simulate(7,x=>{for(const u of x.party)u.skills=[];});
assert(blocked.frames.every(f=>f.burstGauge===200),'ineligible actors preserve full gauge, with no roll');
let start=-1,lastCount=0;for(let i=0;i<success.frames.length;i++){
 const f=success.frames[i];if(f.event==='burst_start'){start=i;lastCount=0;}
 if(f.burst){assert(!(f.kind==='enemy'&&['action_start','interrupt_start','counter','counts'].includes(f.event)));const c=burstPresentation(success,i).count;if(f.kind==='action'&&f.event==='action_start'){assert.equal(c,lastCount+1);assert(battleLeadIn(success,i).some(p=>p.phase==='combo'));lastCount=c;}else if(!['burst_end','burst_interrupted','end'].includes(f.event))assert.equal(c,lastCount);assert(c<=5);}
}
// An old saved replay may contain enemy actions while its burst flag is true.
const old=structuredClone(success);const index=old.frames.findIndex(f=>f.event==='action_start'&&f.burst);old.frames[index]={...old.frames[index],kind:'enemy',actorId:old.waves[0][0].id};assert.equal(burstPresentation(old,index).count,0);assert(!battleLeadIn(old,index).some(p=>p.phase==='combo'));
const wave=simulate(success.seed,x=>{x.waves[0][0].stats.hp=1;x.waves.push(structuredClone(x.waves[0]));});assert(wave.frames.some(f=>f.event==='wave'));
fs.mkdirSync('docs/verification/battle-device-five',{recursive:true});fs.writeFileSync('docs/verification/battle-device-five/wave.json',JSON.stringify(wave));
fs.writeFileSync('docs/verification/battle-device-five/gauge.json',JSON.stringify({success:success.frames.slice(0,3),failure:failure.frames.slice(0,3),checks:'PASS roll-only consumption, approved failed-roll consumption, full-gauge ineligible wait, actual allied action count, old enemy events excluded, wave boundary'},null,2));
console.log('PASS gauge roll/wait/failure/recharge; allied-only combos; wave boundary');
