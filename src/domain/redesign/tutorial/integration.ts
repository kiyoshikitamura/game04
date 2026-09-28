import type { RedesignState } from '../types';
import { GROWTH_VERSION } from '../growthMaster';
import { SCENES, STARTERS, STARTER_SKILLS } from './content';
/** Server-owned transitions. No client inventory snapshot is accepted. */
export function applyTutorialTransition(before: RedesignState, action: string, payload: Record<string, unknown>): RedesignState {
 const state=structuredClone(before), t=state.tutorial;
 if(!t) throw Error('このプレイヤーはチュートリアル対象ではありません。');
 if(action==='tutorial_next') {
  if(!Number.isInteger(payload.step)||payload.step!==t.step||t.step>=SCENES.length) throw Error('進行が更新されています。再読み込みしてください。');
  if(SCENES[t.step].id==='name') {
   const name=typeof payload.name==='string'?payload.name.trim():'';
   if(!name||[...name].length>8||/[\p{Cc}\p{Cf}]/u.test(name)) throw Error('名前は1〜8文字で入力してください。');
   t.name=name;
  }
  t.step++;
  const entering=SCENES[t.step]?.id;
  if(entering==='characters') for(const id of STARTERS) if(!state.characters.some(c=>c.id===id)) state.characters.push({id,level:1,awakening:0,exp:0,growthVersion:GROWTH_VERSION});
  if(entering==='skills') for(const id of STARTER_SKILLS) if(!state.skills.some(s=>s.id===id)) state.skills.push({id,level:0});
  if(entering==='equipped') state.deck=STARTERS.map((characterId,i)=>({characterId,skillIds:[STARTER_SKILLS[i]],equipment:{}}));
  if(t.step===SCENES.length) t.homeVisits=1;
 } else {
  if(t.step<SCENES.length) throw Error('チュートリアルを完了してください。');
  if(action==='tutorial_home'){t.homeVisits++;t.loginEligible=t.homeVisits>=2;}
  else if(action==='tutorial_depart')t.departed=true;
  else if(action==='tutorial_dismiss_defeat')t.defeatPending=false;
  else throw Error('チュートリアル操作が不正です。');
 }
 return state;
}
