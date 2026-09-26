import fs from 'node:fs';
import {gz,write,inBand} from './stage68_decision_lib.mjs';
import {hash} from './audit_stage68.mjs';import {inputFor,run} from './rebuild_stage68_five_tier.mjs';
import {FORMAL_QUEST_STAGES} from '../src/domain/redesign/questMaster.ts';
const old=gz('docs/verification/stage68-implementation-20260927/early-design/1-1.json.gz'),path='docs/verification/stage68-resolution-20260927/band-gap/1-1.json.gz',d=fs.existsSync(path)?gz(path):{stage:'1-1',variants:[],complete:false};
if(!d.complete||process.argv.includes('--refine')){for(const [hp,atk]of (process.argv.includes('--refine')?[[3,10],[3,12],[3,14]]:[[3,15],[3,20],[3,25]])){const name=`hp${hp}-atk${atk}`;if(d.variants.some(v=>v.name===name))continue;const stage=structuredClone(FORMAL_QUEST_STAGES.find(s=>s.designId==='1-1'));for(const e of stage.waves.flat()){e.stats.hp=Math.round(e.stats.hp*hp);e.stats.atk=Math.round(e.stats.atk*atk);}
 const records=old.variants[0].records.map(c=>{const input=inputFor(stage,{party:c.input.party});return {name:c.name,state:c.state,input,inputHash:hash(input),screen:run(input,560001,16,true)};});const v={name,stage,records,coverage:[0,1,2,3,4].map(i=>records.some(c=>inBand(c.screen.rate,i)))};d.variants.push(v);write(path,d);console.log(JSON.stringify({name,coverage:v.coverage,withoutAttackBest:Math.max(...records.filter(c=>!c.state.skills.some(s=>s.id==='SKD003')).map(c=>c.screen.rate))}));}
 d.complete=true;write(path,d);}
