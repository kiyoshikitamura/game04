import type { RedesignState } from './types';
import data from './data/quest65.json';
export const EARLY_RETENTION_VERSION = 'early-retention-v1-20260926';
export type EarlyGuideId = 'join-maeda' | 'equip-iwadan' | 'join-takenaka' | 'equip-fire' | 'missions';
export interface EarlyProgress {
 version: typeof EARLY_RETENTION_VERSION;
 preservedUnlockedStages: string[];
 clearedAdditionalStages: string[];
 additionalStageAttempts: Record<string,number>;
 completedAreas: string[];
 deckSlots: number;
 missionNavigationPending?: boolean;
 guides: Partial<Record<EarlyGuideId, 'pending' | 'deferred' | 'completed'>>;
}
export const EARLY_GUIDE_STAGES: Record<string, EarlyGuideId> = {'mikawa-1':'join-maeda','mikawa-2':'equip-iwadan','mikawa-3':'join-takenaka','mikawa-4':'equip-fire'};
const added = new Set(['mikawa-4','mikawa-5','owari-5']);
/** Invoke before any settlement. Absence marks a pre-rollout state; empty progress is safe for new accounts. */
export function initializeEarlyProgress(original: RedesignState): RedesignState {
 const state = structuredClone(original);
 if (!state.earlyProgress) {
  const old = data.stages.filter(s=>!added.has(s.id));
  const cleared = new Set(state.clearedStages);
  const completedAreas = [...new Set(old.map(s=>s.areaId))].filter(a=>old.filter(s=>s.areaId===a).every(s=>cleared.has(s.id)));
  state.earlyProgress = {version:EARLY_RETENTION_VERSION,
   preservedUnlockedStages:old.filter((s,i)=>i===0||cleared.has(s.id)||cleared.has(old[i-1].id)).map(s=>s.id),
   clearedAdditionalStages:[],additionalStageAttempts:{},completedAreas,deckSlots:Math.max(state.deck.length,cleared.has('mikawa-2')?5:cleared.has('mikawa-1')?4:3),guides:{}};
  // Never replay acquisition guides or the mandatory area guide for pre-rollout clears.
  for(const [id,guide] of Object.entries(EARLY_GUIDE_STAGES))if(!added.has(id)&&cleared.has(id))state.earlyProgress.guides[guide]='completed';
  if(completedAreas.includes('mikawa'))state.earlyProgress.guides.missions='completed';
 }
 if(state.tutorial)state.tutorial.defeatPending=false;
 return state;
}
/** The caller commits this with rewards/clear history, not when a dialog is closed. */
export function recordEarlyQuestClear(before: RedesignState, settled: RedesignState, stageId: string, legacyLayout=false): RedesignState {
 const state=initializeEarlyProgress(before), next={...structuredClone(settled),earlyProgress:state.earlyProgress!};
 if(next.tutorial)next.tutorial.defeatPending=false;
 const p=next.earlyProgress;
 if(legacyLayout){
  const old=structuredClone(settled);delete old.earlyProgress;const migrated=initializeEarlyProgress(old).earlyProgress!;
  p.preservedUnlockedStages=[...new Set([...p.preservedUnlockedStages,...migrated.preservedUnlockedStages])];
  p.completedAreas=[...new Set([...p.completedAreas,...migrated.completedAreas])];p.deckSlots=Math.max(p.deckSlots,migrated.deckSlots);
  const guide=EARLY_GUIDE_STAGES[stageId];if(guide)p.guides[guide]='completed';
  if(migrated.completedAreas.includes('mikawa')){p.guides.missions='completed';p.missionNavigationPending=false;}
  return next;
 }
 if(added.has(stageId)&&!p.clearedAdditionalStages.includes(stageId))p.clearedAdditionalStages.push(stageId);
 if(!hasQuestClear(stageId,before.clearedStages,before.earlyProgress)) {
  const guide=EARLY_GUIDE_STAGES[stageId];if(guide&&!p.guides[guide])p.guides[guide]='pending';
 }
 p.deckSlots=Math.max(p.deckSlots,next.clearedStages.includes('mikawa-3')?5:next.clearedStages.includes('mikawa-1')?4:3,next.deck.length);
 for(const area of [...new Set(data.stages.map(s=>s.areaId))])if(!p.completedAreas.includes(area)&&data.stages.filter(s=>s.areaId===area).every(s=>hasQuestClear(s.id,next.clearedStages,p))) {
  p.completedAreas.push(area);
  if(area==='mikawa'&&!p.guides.missions)p.guides.missions='pending';
 }
 return next;
}
export function nextEarlyGuide(state: RedesignState, context: {battlePlaying:boolean;resultOpen:boolean}): EarlyGuideId | null {
 if(context.battlePlaying||context.resultOpen)return null;
 if(state.earlyProgress?.missionNavigationPending)return 'missions';
 return (['join-maeda','equip-iwadan','join-takenaka','equip-fire','missions'] as EarlyGuideId[]).find(id=>state.earlyProgress?.guides[id]==='pending')??null;
}
export const AREA_ONE_COMPLETE_TEXT='三河での戦、見事じゃ！\nここからは任務を道しるべに、仲間を育て、部隊を整えるのじゃ。\nいざ、天下統一へ！';

/** Ancient pre-65 IDs may collide with added IDs: retain their history, track new clears separately. */
export function hasQuestClear(id:string, cleared:readonly string[], progress?:EarlyProgress):boolean {
 return added.has(id)&&progress ? progress.clearedAdditionalStages.includes(id) : cleared.includes(id);
}

export function recordEarlyQuestAttempt(state:RedesignState,stageId:string):RedesignState {
 const next=structuredClone(state);
 if(added.has(stageId)&&next.earlyProgress)next.earlyProgress.additionalStageAttempts[stageId]=(next.earlyProgress.additionalStageAttempts[stageId]??0)+1;
 return next;
}
