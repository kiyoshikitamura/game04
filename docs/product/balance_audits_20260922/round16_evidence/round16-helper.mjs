import fs from 'node:fs';
import {simulateBalanceBattle} from './battleBalanceV2.ts';
import {rules,unit,skill} from './model.mjs';
const read=p=>JSON.parse(fs.readFileSync(p)),copy=structuredClone;
const ids=read('outputs/GAME04_バランス監査_進捗管理.json').remainingStageJudgment;
const prev=read('battle-check/round14-results.json').results, stages=read('battle-check/integrated8-results.json').results, fx=read('outputs/GAME04_ACCEPTANCE_FIXTURES_V1.json').fixtures;
const historical=read('battle-check/target14-results.json').results, altHist=read('battle-check/alternate14-results.json').results;
const fixedLevels={'2-3':15,'2-4':18,'3-5':30,'4-3':35};
const reduceCompetition=new Set(['3-3','4-1','4-2','4-4','6-1','6-2','6-4','6-5','6-6','7-1','7-6','7-7','7-8','8-1','8-4','8-5','8-7','8-8','9-7','9-9']);
const attackId={fire:'SKD007',water:'SKD008',earth:'SKD009',wind:'SKD010',light:'SKD011',dark:'SKD012'};
function run(party,waves,start=14001,n=30){const runs=[];for(let seed=start;seed<start+n;seed++){
 const r=simulateBalanceBattle({rules,seed,party,waves}),last=r.frames.at(-1),isAlly=id=>party.some(u=>u.id===id);
 let casts={},enemyCasts={},effects={},enemyEffects={},allySkips=0,enemySkips=0,allyCounterDamage=0,enemyCounterDamage=0,waveCarry=[];
 for(const f of r.frames){let a=isAlly(f.actorId);if(f.event==='action_start'){const d=a?casts:enemyCasts;d[f.skillId]=(d[f.skillId]??0)+1;}if(['cleanse','effect_applied','heal','revive','shield_absorbed'].includes(f.event)){const d=a?effects:enemyEffects,key=f.skillId+':'+f.event;d[key]=(d[key]??0)+1;}if(f.event==='stun_skip'){if(a)allySkips++;else enemySkips++;}if(f.event==='counter'){const hits=(f.hits??[]).reduce((s,v)=>s+(typeof v==='number'?v:0),0);if(a)allyCounterDamage+=hits;else enemyCounterDamage+=hits;}if(f.event==='wave')waveCarry.push({hp:f.party.map(u=>u.hp/u.maxHp),statuses:f.party.map(u=>u.statuses.map(s=>s.type)),sp:f.partySp});}
 runs.push({seed,win:r.outcome==='win',actions:r.playerActions,hp:last.party.reduce((s,p)=>s+p.hp,0)/last.party.reduce((s,p)=>s+p.maxHp,0),alive:last.party.filter(p=>p.hp>0&&!p.dead).length,unitHp:last.party.map(p=>({id:p.id,hp:p.hp/p.maxHp})),casts,enemyCasts,effects,enemyEffects,allySkips,enemySkips,allyCounterDamage,enemyCounterDamage,waveCarry});
 }return runs;}

export {run};
