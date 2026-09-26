import fs from 'node:fs';
import zlib from 'node:zlib';
import {hash} from './audit_stage68.mjs';
export const SOURCE='docs/verification/stage68-five-tier-20260926';
export const OUT='docs/verification/stage68-decision-20260927';
export const rows=JSON.parse(fs.readFileSync(`${SOURCE}/audit-table.json`));
export const labels=['全勝','約60%','約30%','0%超～10%','観測0%'];
export const targets=[1,.6,.3,.05,0];
export const inBand=(rate,i)=>[rate===1,rate>=.5&&rate<=.7,rate>=.2&&rate<=.4,rate>0&&rate<=.1,rate===0][i];
export const gz=p=>JSON.parse(zlib.gunzipSync(fs.readFileSync(p)));
export const write=(p,d)=>{fs.mkdirSync(p.slice(0,p.lastIndexOf('/')),{recursive:true});const b=JSON.stringify(d,null,p.endsWith('.gz')?0:2);fs.writeFileSync(p+'.tmp',p.endsWith('.gz')?zlib.gzipSync(b):b+'\n');fs.renameSync(p+'.tmp',p);};
export function assetCheck(c,r){
 const e=r.acquisition,missing=[];
 if(!c.state)return {covered:false,missing:['状態対応がない対照']};
 for(const x of c.state.characters)if(!e.trainedCharacters.some(t=>t.id===x.id&&t.level>=x.level&&t.awakening>=x.awakening))missing.push(`武将:${x.id}:Lv${x.level}:覚醒${x.awakening}`);
 for(const x of c.state.skills)if(!e.trainedSkills.some(t=>t.id===x.id&&t.level>=x.level)&&!(+r.stage.split('-')[0]<=2&&x.level===0&&e.availableGuaranteedSkills.includes(x.id)))missing.push(`技:${x.id}:LB${x.level}`);
 const gear=[...e.trainedEquipment];for(const x of c.state.equipment){let i=gear.findIndex(t=>t.masterId===x.masterId&&t.level>=x.level&&t.lb>=x.lb);if(i<0)missing.push(`装備:${x.masterId}:Lv${x.level}:LB${x.lb}`);else gear.splice(i,1);}
 return {covered:!missing.length,missing};
}
export function candidatesFor(r){
 const path=`${SOURCE}/${r.stage}-validated.json.gz`,d=gz(path);
 const cs=d.records.map(c=>({...c,evidence:path,origin:'recovered-record'}));
 for(const c of d.controls){
  const base=d.records.find(b=>hash([...b.input.party].sort((a,b)=>a.id.localeCompare(b.id)))===hash([...c.input.party].sort((a,b)=>a.id.localeCompare(b.id))));
  let state;if(base){state=structuredClone(base.state);state.deck=c.input.party.map(p=>state.deck.find(m=>m.characterId===p.id));}
  cs.push({...c,state,inputHash:hash(c.input),evidence:path,origin:'recovered-order-control'});
 }
 const early=`${OUT}/${r.stage}-early.json.gz`;if(fs.existsSync(early)){let c=gz(early);if(c.validation)cs.push({...c,evidence:early,origin:'new-early'});}
 const order=`${OUT}/${r.stage}-order.json.gz`;if(fs.existsSync(order))for(const c of gz(order).records)if(c.validation)cs.push({...c,evidence:order,origin:'new-order'});
 for(const c of cs){c.inputHash??=hash(c.input);c.asset=assetCheck(c,r);}
 return {d,cs};
}
export const brief=c=>c?{name:c.name,wins:c.validation.wins,n:c.validation.n,percent:100*c.validation.rate,inputHash:c.inputHash,evidence:c.evidence,assets:c.asset,order:c.input.party.map(p=>({id:p.id,skills:p.skills.map(s=>s.id)})),actions:c.validation.actions,meanActions:c.validation.meanActions,coreCasts:Object.fromEntries([...new Set(c.input.party.flatMap(p=>p.skills.map(s=>s.id)))].map(id=>[id,c.validation.runs.filter(r=>(r.casts?.[id]??0)>0).length]))}:null;
export function propose(r,cs){
 const usable=cs.filter(c=>c.asset.covered),proposals=[];
 for(let band=1;band<5;band++){
  if(usable.some(c=>inBand(c.validation.rate,band)))continue;
  const nearest=[...usable].sort((a,b)=>Math.abs(a.validation.rate-targets[band])-Math.abs(b.validation.rate-targets[band]));
  let found;
  for(const base of nearest){
   for(let i=0;i<base.input.party.length-1&&!found;i++)for(let j=i+1;j<base.input.party.length&&!found;j++){
    if(JSON.stringify(base.input.party[i].skills)===JSON.stringify(base.input.party[j].skills))continue;
    const input=structuredClone(base.input);[input.party[i],input.party[j]]=[input.party[j],input.party[i]];
    const inputHash=hash(input);if(cs.some(c=>c.inputHash===inputHash))continue;
    const state=structuredClone(base.state);state.deck=input.party.map(p=>state.deck.find(m=>m.characterId===p.id));
    found={name:`band${band}-swap${i+1}${j+1}-${base.name}`,band,label:labels[band],status:'UNTESTED',base:brief(base),swapPositions:[i+1,j+1],state,input,inputHash,explanation:`${base.name}の${i+1}番と${j+1}番を交換。武将・Lv・覚醒・技LB・装備・敵は同一。SPを先に使う技、支援前後、通常攻撃/BURSTへの参加順を変える限定候補。目標勝率になるとの保証はない。`};
   }
   if(found)break;
  }
  if(found)proposals.push(found);
 }
 return proposals;
}
