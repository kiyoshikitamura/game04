import type { RedesignState } from './types';
import { earlyGuideDeck, earlyLoadoutPlan } from './earlyLoadout';
import type { EarlyGuideId } from './earlyProgress';
export function applyEarlyAction(before: RedesignState, action: string, payload: Record<string,unknown>): RedesignState {
 const state=structuredClone(before);
 if(!state.earlyProgress)throw Error('初期ガイドの状態を再読み込みしてください。');
 if(action==='early_missions_opened'){if(!state.earlyProgress.missionNavigationPending)throw Error('任務遷移待ちではありません。');state.earlyProgress.missionNavigationPending=false;state.earlyProgress.guides.missions='completed';return state;}
 if(action==='early_auto_loadout'){
  if(!state.earlyProgress.clearedAdditionalStages.includes('mikawa-4'))throw Error('おまかせ編成は1-4クリア後に利用できます。');
  state.deck=earlyLoadoutPlan(state);return state;
 }
 if(action!=='early_guide')throw Error('未対応のガイド操作です。');
 const guide=String(payload.guide) as EarlyGuideId,choice=String(payload.choice);
 if(state.earlyProgress.guides[guide]!=='pending')throw Error('ガイドは処理済みです。再読み込みしてください。');
 if(guide==='join-maeda'||guide==='equip-iwadan'){
  if(choice!=='save')throw Error('部隊への保存が必要です。');state.deck=earlyGuideDeck(state,guide);
 }else if(guide==='missions'){
  if(choice!=='missions')throw Error('任務へ進んでください。');state.earlyProgress.missionNavigationPending=true;
 }else if(guide==='join-takenaka'||guide==='equip-fire'){
  if(!['later','characters'].includes(choice))throw Error('操作を選んでください。');
 }else throw Error('ガイドが不正です。');
 state.earlyProgress.guides[guide]=guide==='missions'?'pending':choice==='later'?'deferred':'completed';return state;
}
