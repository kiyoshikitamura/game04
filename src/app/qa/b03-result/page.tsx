import {notFound} from 'next/navigation';
import RecordedBattleResult from '@/app/components/redesign/RecordedBattleResult';
import {ResultRewards} from '@/app/components/redesign/QuestView';
import {createInitialState,buildBattleParty,BATTLE_RULES} from '@/domain/redesign/masters';
import {FORMAL_QUEST_STAGES,createQuestBattleInput,questVictoryRewards} from '@/domain/redesign/questMaster';
import {applyPlayerExperience} from '@/domain/redesign/growthMaster';
import {simulateBattle} from '@/domain/redesign/battle';
export const dynamic='force-dynamic';
export default function Page(){
 if(process.env.NODE_ENV!=='development')notFound();
 const state=createInitialState('local-result-review'),party=buildBattleParty(state),stage=FORMAL_QUEST_STAGES[0];
 const battle=simulateBattle(createQuestBattleInput(917,party,stage,BATTLE_RULES));
 const grant=questVictoryRewards(stage,state,party,917);
 const gain=battle.outcome==='win'?stage.playerExp:0;
 const growth=applyPlayerExperience(1,0,gain,50,100);
 const settlement={battle,rewards:battle.outcome==='win'?grant.rewards:[],firstClear:battle.outcome==='win',playerGrowth:{status:'active',beforeLevel:1,level:growth.level,gainedExp:gain,energy: growth.energy,energyMax:100,energyRecovered:growth.energy-50}};
 return <RecordedBattleResult result={battle} title={stage.name} backgroundSrc="/bg/approved-20260925/quest-mikawa.webp" rewards={<ResultRewards settlement={settlement} stage={stage}/>} actions={<><button disabled>次のステージ</button><button disabled>ステージ一覧</button></>}/>;
}
