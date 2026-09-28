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
const results=[];
for(const id of ids){const b=prev.find(x=>x.id===id),st=stages.find(x=>x.id===id),a=+id.split('-')[0],fixture=fx.find(f=>f.id===b.fixture),lb=fixture.members[0].skills[0]?.lb??0;
 const main=copy(fixedLevels[id]?historical.find(x=>x.id===id&&x.variant==='historical_level'&&x.mode==='mapped').party:b.cases.find(x=>x.mode==='mapped').party);let notes=[];
 if(reduceCompetition.has(id)){for(const u of main){u.skills=u.skills.filter(s=>s.id!=='SKD034');u.skills=u.skills.map(s=>s.id==='SKD014'?skill('SKD008',lb):s);}notes.push('検証編成のみ: 身構えを外し、主砲014を標準008へ替えて対策SP競合を軽減');}
 let control=copy(main),controlLabel='焦点スキル除去';
 for(const u of control)u.skills=u.skills.filter(s=>!b.focus.includes(s.id));
 if(id==='1-1'){control=copy(main);for(const u of control)u.skills=[];controlLabel='通常攻撃のみ（学習用。勝敗差必須としない）';}
 if(id==='1-2'){control=copy(main);[control[0],control[2]]=[control[2],control[0]];controlLabel='回復役を前列へ配置。未装備034の除去比較を廃止';}
 if(['1-3','5-3'].includes(id)){control=copy(main);for(const u of control)u.skills=u.skills.map(s=>b.focus.includes(s.id)?skill(id==='5-3'?'SKD008':'SKD008',lb):s);controlLabel='同レア・同消費SPの別属性攻撃に変更';}
 if(['5-1','5-2','5-4','5-5','5-6','10-5'].includes(id)){control=copy(main);for(const u of control)u.skills=u.skills.map(s=>s.effects.some(e=>e.type==='damage')?skill('SKD007',lb):s);controlLabel='攻撃スキルを火の標準攻撃に統一。キャラ属性編成そのものの比較ではない';}
 let alternative=copy(fixedLevels[id]?altHist.find(x=>x.id===id).party:b.cases.find(x=>x.mode==='alternate_character').party);
 // Carry precisely the main skill allocation onto corresponding slots of the character alternative.
 for(let i=0;i<alternative.length;i++)alternative[i].skills=copy(main[i].skills);
 const fm=fx.find(f=>f.id===`A${a}-farm`),farm=main.map(p=>{const m=fm.members.find(x=>x.name===p.name);if(!m)throw Error('farm member '+id+p.name);const u=unit(m.name,m.level,m.awakening);u.stats=copy(m.stats);u.skills=copy(p.skills);return u;});
 let direct=copy(main);for(const u of direct)u.skills=u.skills.map(s=>b.focus.includes(s.id)?skill(attackId[s.element],lb):s);
 const cases=[];for(const [mode,party] of [['main',main],['control',control],['direct',direct],['alternative',alternative],['farm',farm]])cases.push({mode,party,runs:run(party,st.waves,mode==='farm'?14101:14001,mode==='farm'?20:30)});
 results.push({id,concept:b.concept,focus:b.focus,fixture:b.fixture,levelNote:fixedLevels[id]??null,notes,controlLabel,waves:st.waves,cases});
 fs.writeFileSync('battle-check/round16-checkpoint.json',JSON.stringify({results}));console.log(id,cases.map(c=>c.mode+':'+c.runs.filter(r=>r.win).length+'/'+c.runs.length).join(' '));
}
fs.writeFileSync('battle-check/round16-results.json',JSON.stringify({status:'AUDIT_EVIDENCE_NOT_MASTER_FIX',basis:fs.readFileSync('/tmp/round16-head.txt','utf8').trim(),seeds:{first:[14001,14030],farm:[14101,14120]},rules,numericChanges:false,results}));
