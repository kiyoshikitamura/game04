/** TEST_ONLY_NOT_BALANCE_APPROVAL. Deliberately artificial boundary fixtures. */
import {rules as oldRules, skill as oldSkill, unit as oldUnit, enemy as oldEnemy} from '../game04-battle-common/fixtures.mjs';
export const config={status:'PREVIEW_PROVISIONAL',version:'TEST_ONLY_ADDITIONS_V2_20260920',damageBonusCap:50,healingBonusCap:80,shieldBonusCap:50,shieldHpCap:.5,periodicCapMultiplier:2,lowHpThreshold:.4,highHpThreshold:.7,diversityFactors:[0,.25,.5,.75,1]};
export const rules={...oldRules,version:'balance-v2-20260920',balanceV2:config};
export const skill=(id,effects,extra={})=>oldSkill(id,0,{effects,...extra});
export const unit=(id='p',extra={})=>oldUnit(id,extra);
export const enemy=(id='e',extra={})=>oldEnemy(id,extra);
export const input=(extra={})=>({seed:42,party:[unit()],waves:[[enemy()]],rules:structuredClone(rules),...extra});
export const passive=(type,percent,extra={})=>({id:type,name:type,type,percent,stat:'atk',target:'self',...extra});
export const state=(frame,id)=>[...frame.party,...frame.enemies].find(u=>u.id===id);
export const events=(result,event)=>result.frames.filter(f=>f.event===event);
export const acts=(result,id)=>events(result,'action_end').filter(f=>!id||f.actorId===id);
export const statuses=(frame,id,type)=>state(frame,id).statuses.filter(s=>s.type===type);
