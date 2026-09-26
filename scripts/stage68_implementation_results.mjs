import fs from 'node:fs';
import {rows,candidatesFor,gz,inBand,targets} from './stage68_decision_lib.mjs';
import {hash} from './audit_stage68.mjs';
import {metrics} from './stage68_adoption_lib.mjs';
export const OUT='docs/verification/stage68-implementation-20260927';
export {rows,metrics,hash};
export function readMaybe(folder,id){const path=`${OUT}/${folder}/${id}.json.gz`;return fs.existsSync(path)?{...gz(path),evidence:path}:null;}
export function records(folder,id){const d=readMaybe(folder,id);return d?.records.filter(c=>c.validation).map(c=>({...c,evidence:d.evidence}))??[];}
export function mechanism(c){return [...new Set(c.input.party.flatMap(p=>p.skills.filter(s=>c.validation.runs.filter(r=>(r.casts?.[s.id]??0)>0).length>=c.validation.n/2).flatMap(s=>s.effects.map(e=>e.type+'@'+s.target))))].sort().join('/');}
export function assess(cs){
 const tiers=[0,1,2,3,4].map(b=>cs.filter(c=>inBand(c.validation.rate,b)).sort((a,c)=>metrics(a.validation).actionLimit-metrics(c.validation).actionLimit||Math.abs(a.validation.rate-targets[b])-Math.abs(c.validation.rate-targets[b]))[0]??null);
 const p=tiers[0],a=p?cs.filter(c=>c.validation.rate>=.5&&mechanism(c)!==mechanism(p)).sort((a,b)=>b.validation.rate-a.validation.rate)[0]:null;
 const used=[...new Set([p,a].filter(Boolean).flatMap(c=>c.state.skills.map(s=>s.id)))];
 const dependency=used.map(id=>({id,without:cs.filter(c=>!c.state.skills.some(s=>s.id===id)&&c.validation.rate>=.3).sort((a,b)=>b.validation.rate-a.validation.rate)[0]??null}));
 return {tiers,primary:p,alternative:a,missing:tiers.map((c,i)=>c?null:i).filter(x=>x!==null),dependency,stalled:cs.filter(c=>metrics(c.validation).actionLimit>0)};
}
export function stageResults(row){
 const base=candidatesFor(row).cs.filter(c=>c.asset.covered),baseline=[...base,...records('bands',row.stage),...records('search',row.stage),...records('fill',row.stage),...records('early',row.stage)];
 const variants=[];
 for(const kind of ['early','late']){const d=readMaybe(kind+'-validation',row.stage);if(d){const cs=[...records(kind+'-validation',row.stage),...records('search-'+kind,row.stage),...records(kind+'-dependency',row.stage)];const a=assess(cs);variants.push({mode:kind,stage:d.stageProposal,records:cs,assessment:a});}}
 for(const kind of ['stalls','stall-micro','stall-finisher','stall-terminal']){const d=readMaybe(kind,row.stage);if(!d?.passed)continue;const v=d.variants.find(v=>kind==='stall-micro'?v.factor===d.selectedFactor:v.name===d.selected);const cs=[...v.records.filter(c=>c.validation).map(c=>({...c,evidence:d.evidence})),...records(kind==='stall-terminal'?'search-terminal':kind==='stall-micro'?'search-micro':kind==='stall-finisher'?'search-finisher':'search-stall',row.stage),...records(kind==='stall-terminal'?'dependencies-terminal':kind==='stall-micro'?'dependencies-micro':kind==='stall-finisher'?'dependencies-finisher':'dependencies',row.stage)];variants.push({mode:kind,stage:v.stage,records:cs,assessment:assess(cs)});}
 const eligible=variants.filter(v=>!v.assessment.missing.length&&v.assessment.alternative&&v.assessment.dependency.every(d=>d.without)&&!v.assessment.stalled.length);
 const selected=eligible.at(-1)??null;
 return {row,baseline,baselineAssessment:assess(baseline),variants,selected,current:selected?.records??baseline,assessment:selected?.assessment??assess(baseline)};
}
export const brief=c=>c?{name:c.name,inputHash:c.inputHash??hash(c.input),evidence:c.evidence,metrics:metrics(c.validation),state:c.state,order:c.input.party.map(p=>({id:p.id,skills:p.skills.map(s=>s.id)})),mechanism:mechanism(c),coreCasts:Object.fromEntries([...new Set(c.input.party.flatMap(p=>p.skills.map(s=>s.id)))].map(id=>[id,c.validation.runs.filter(r=>(r.casts?.[id]??0)>0).length])),burstRuns:c.validation.runs.filter(r=>r.bursts>0).length}:null;
if(process.argv[1]?.endsWith('stage68_implementation_results.mjs')){let count=0;for(const r of rows){const x=stageResults(r);if(!x.assessment.missing.length)count++;if(x.variants.length)console.log(JSON.stringify({stage:r.stage,selected:x.selected?.mode,variants:x.variants.map(v=>({mode:v.mode,missing:v.assessment.missing,alt:!!v.assessment.alternative,dependency:v.assessment.dependency.filter(d=>!d.without).map(d=>d.id),stalled:v.assessment.stalled.map(c=>c.name)}))}));}console.log({fiveBands:count});}
