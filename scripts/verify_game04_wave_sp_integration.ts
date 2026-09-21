import assert from 'node:assert/strict';
import { RAID_MASTERS, raidEnemy } from '../src/domain/redesign/raid.ts';
import { BATTLE_RULES, prepareBattleWaves } from '../src/domain/redesign/masters.ts';
import { simulateBattle } from '../src/domain/redesign/battle.ts';
for(const master of RAID_MASTERS)for(const level of [1,master.maxLevel]){
 const e=raidEnemy(master,level); assert.equal(e.initialSp,e.stats.sp);
 const p={id:'p',name:'p',image:'',level:1,element:'fire' as const,stats:{hp:1,sp:1,atk:1,def:1,luk:1},skills:[],passives:[]};
 const result=simulateBattle({seed:1,party:[p],waves:prepareBattleWaves([[e]],BATTLE_RULES),rules:BATTLE_RULES});
 assert.equal(result.frames[0].enemies[0].sp,result.frames[0].enemies[0].maxSp);
}
console.log('PASS both raid modes start full at Lv1 and maximum level');
