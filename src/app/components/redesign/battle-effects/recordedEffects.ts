import type { BattleResult } from '../../../../domain/redesign/battle';
import { projectRecordedBattleFrame } from '../../../../domain/presentation/recordedBattlePresentation';
import { resolveBattleFrameEffects } from '../battleEffectPresentation';
import { effectDuration } from './settings';
import assets from './assets.json';
import { skillVfxAssets, skillVfxDuration } from './skillVfx24';

export function recordedEffects(result: BattleResult, index: number) {
  const frame=result.frames[index];
  if(!frame) return [];
  const effects=resolveBattleFrameEffects(frame,result.frames[index-1],projectRecordedBattleFrame(result,index).skill);
  if(!effects.some(effect=>effect.vfx))return effects;
  let start=index;
  while(start>0 && result.frames[start].event!=='action_start' && result.frames[start-1].wave===frame.wave) start--;
  let end=index+1;
  while(end<result.frames.length && !['action_start','action_end','interrupt_end','end','wave'].includes(result.frames[end].event??'') && result.frames[end].wave===frame.wave) end++;
  const earlier=result.frames.slice(start,index);
  const leadIn=!earlier.some((record,offset)=>record.actorId===frame.actorId && record.skillId===frame.skillId && resolveBattleFrameEffects(record,result.frames[start+offset-1],projectRecordedBattleFrame(result,start+offset).skill).some(effect=>effect.vfx));
  // Area lead-in uses only targets of successful recorded outcomes in this action.
  // Individual impacts remain on the exact current target; no extra hits or numbers.
  const areaTargetIds=[...new Set(result.frames.slice(start,end).flatMap((record,offset)=>record.actorId===frame.actorId && record.skillId===frame.skillId && record.event===frame.event ? resolveBattleFrameEffects(record,result.frames[start+offset-1],projectRecordedBattleFrame(result,start+offset).skill).filter(effect=>effect.vfx).map(effect=>effect.targetId):[]))];
  return effects.map(effect=>effect.vfx?{...effect,vfx:{...effect.vfx,leadIn,areaTargetIds}}:effect);
}
/** Presentation-only minimum; never mutates the recorded frames or their outcomes. */
export function minimumEffectFrameDuration(result: BattleResult,index: number) {
  const effects=recordedEffects(result,index);
  return Math.max(0,...effects.map(effect=>effect.vfx?skillVfxDuration(effect.vfx):effectDuration(effect.family,effects.filter(other=>other.family===effect.family&&result.frames[index].party.some(u=>u.id===other.targetId)===result.frames[index].party.some(u=>u.id===effect.targetId)).length)));
}
export function effectAssetPaths(effects: ReturnType<typeof recordedEffects>) {
  return [...new Set(effects.flatMap(effect=>effect.vfx?skillVfxAssets(effect.vfx):assets[effect.family].assets))];
}
