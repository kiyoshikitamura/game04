import type { BattleResult, BattleUnitState } from '../redesign/battle';
import { MVP_SCORE_MAX, type MvpCandidate } from './battleResultScoring';

/** Presentation-only projection of the persisted GAME04 result; never re-simulates combat. */
export function recordedBattleMvp(result: BattleResult): { mvp: MvpCandidate | null; candidates: MvpCandidate[]; unavailable: string | null } {
  if (!result.frames.length || result.frames.some(frame => !frame.event) || result.party.some(unit=>!result.analysis.some(a=>a.id===unit.id))) return {mvp:null,candidates:[],unavailable:'この記録はMVP集計に必要な情報を含んでいません。'};
  const raw = new Map(result.party.map(unit => [unit.id, {damage:result.analysis.find(a=>a.id===unit.id)?.damage ?? 0,heal:result.analysis.find(a=>a.id===unit.id)?.healing ?? 0,kills:0,shield:0,survived:false}]));
  let unavailable: string | null = null;
  const states = (frame: BattleResult['frames'][number]) => [...frame.party,...frame.enemies];
  for(let i=1;i<result.frames.length;i++) {
    const frame=result.frames[i],previous=result.frames[i-1];
    if(frame.wave!==previous.wave)continue;
    const old=states(previous);
    for(const targetId of frame.targetIds ?? []) {
      const before=old.find(u=>u.id===targetId),after=states(frame).find(u=>u.id===targetId);
      if(!before||!after)continue;
      if(['damage','counter','dot'].includes(frame.event!) && before.hp>0 && after.hp<=0 && frame.enemies.some(u=>u.id===targetId)) {
        let source=frame.actorId;
        if(frame.event==='dot') {
          const sources=[...new Set(before.statuses.filter(s=>s.type==='dot'&&!s.sourceEnemy).map(s=>s.sourceId))];
          if(sources.length!==1||!sources[0]) {unavailable='継続ダメージの撃破帰属をこの記録から確定できません。';continue;}
          source=sources[0];
        }
        if(source&&raw.has(source))raw.get(source)!.kills++;
      }
      if(frame.event==='effect_applied') {
        const key=(s:BattleUnitState['statuses'][number])=>JSON.stringify([s.type,s.sourceId,s.sourceSkillId,s.appliedAction,s.sequence]);
        const prior=before.statuses.map(key);
        for(const status of after.statuses.filter(s=>s.type==='shield')) {
          const found=prior.indexOf(key(status));if(found>=0){prior.splice(found,1);continue;}
          const source=status.sourceId ?? frame.actorId;
          if(source&&raw.has(source)){if(status.amount===undefined)unavailable="シールド付与量をこの記録から確定できません。";else raw.get(source)!.shield+=Math.max(0,status.amount);}
        }
      }
    }
  }
  const last=result.frames.at(-1)!;
  for(const unit of result.party)raw.get(unit.id)!.survived=(last.party.find(u=>u.id===unit.id)?.hp??0)>0;
  const max={damage:0,kills:0,heal:0,shield:0};
  for(const value of raw.values())for(const key of ['damage','kills','heal','shield'] as const)max[key]=Math.max(max[key],value[key]);
  const candidates=result.party.map(unit=>{
    const value=raw.get(unit.id)!;
    const relative=(key:keyof typeof max)=>max[key]>0?Math.round(MVP_SCORE_MAX[key]*value[key]/max[key]):0;
    const score={damage:relative('damage'),kills:relative('kills'),heal:relative('heal'),shield:relative('shield'),survival:value.survived?5:0,total:0};
    score.total=score.damage+score.kills+score.heal+score.shield+score.survival;
    return {participant:{id:unit.id,characterId:unit.id,name:unit.name,isEnemy:false},raw:value,score};
  }).sort((a,b)=>b.score.total-a.score.total||b.raw.damage-a.raw.damage||b.raw.kills-a.raw.kills||a.participant.characterId.localeCompare(b.participant.characterId));
  return {mvp:unavailable?null:candidates[0]??null,candidates,unavailable};
}
