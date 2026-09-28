'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAudio } from '@/audio/AudioProvider';
import BattleView from '@/app/components/redesign/BattleView';
import ActionButton from '@/app/components/ui/ActionButton';
import CowboyDisplay from '@/app/components/redesign/visual-bench/CowboyDisplay';
import { CharacterCard } from '@/app/components/redesign/visual-bench/CharacterDisplays';
import { AssetIcon } from '@/app/components/ui/AssetChoice';
import { CHARACTER_MASTERS } from '@/domain/redesign/masters';
import { getFormalOwnedSkill } from '@/domain/redesign/formalOwnedSkills';
import { newTutorial, advanceTutorial } from '@/domain/redesign/tutorial/state';
import { STARTERS, STARTER_SKILLS, SCENES, BACKGROUNDS } from '@/domain/redesign/tutorial/content';
import { createTutorialBattle } from '@/domain/redesign/tutorial/battle';
import { createTutorialTrailerBattle } from '@/domain/redesign/tutorial/trailer';
import '@/app/components/redesign/redesign.css';
import '../tutorial/tutorial.css';
import './opening.css';
import type { RedesignState } from '@/domain/redesign/types';
import { tutorialFailure } from '@/domain/redesign/tutorial/errors';

const IDS=['world','challenge','oda','trailer','need','blackout','osaka','name','recruit','test','formation','ready','practice','farewell','complete'] as const;
export type OpeningScene=typeof IDS[number];
type Scene=OpeningScene;
interface LiveOpening { state:RedesignState; initialScene:Scene; initialName:string; onSceneChange:(scene:Scene,name:string)=>void; advance:(scene:Scene,name:string)=>Promise<void>; }
const OSAKA='/creative/backgrounds/char_ageha_01.png';
const member=(id:string)=>CHARACTER_MASTERS.find(c=>c.id===id)!;
/** Exercise the existing grants and equipment transition, only in an isolated preview object. */
function preparation() {
  let save=newTutorial('opening-preview');
  while(SCENES[save.step]?.id!=='equip') {
    save=advanceTutorial(save,{type:'next',step:save.step},'opening-prepare-'+save.step);
  }
  return save;
}

export default function TutorialOpeningPreview({live}:{live?:LiveOpening}={}) {
  const [scene,setScene]=useState<Scene>(live?.initialScene??'world');
  const [name,setName]=useState(live?.initialName??'');
  const [pending,setPending]=useState(false);
  const advancing=useRef(false);
  const [error,setError]=useState('');
  const [save,setSave]=useState(preparation);
  const [run,setRun]=useState(0);
  const {unlockAudio,playBgm,stopBgm,playLegacySe}=useAudio();
  const trailer=useMemo(()=>createTutorialTrailerBattle(),[]);
  const practiceState=live?.state??save.game;
  const [livePractice,setLivePractice]=useState<ReturnType<typeof createTutorialBattle>|null>(null);
  const practice=useMemo(()=>live?livePractice:save.game.deck.length?createTutorialBattle(save.game):null,[live,livePractice,save]);
  useEffect(()=>{if(live&&scene==='practice'&&!livePractice&&practiceState.deck.length)setLivePractice(createTutorialBattle(practiceState));},[live,scene,livePractice,practiceState]);
  useEffect(()=>{live?.onSceneChange(scene,name);},[scene,name,live]);
  const battle=scene==='trailer'||scene==='practice';
  useEffect(()=>{document.body.classList.add('rd-active');return()=>document.body.classList.remove('rd-active');},[]);
  useEffect(()=>{
    if(battle)return;
    if(scene==='need'||scene==='blackout') stopBgm(); else playBgm('TITLE');
  },[scene,battle,playBgm,stopBgm]);
  useEffect(()=>{
    if(scene!=='blackout'&&scene!=='osaka')return;
    const timer=setTimeout(()=>setScene(scene==='blackout'?'osaka':'name'),scene==='blackout'?400:1400);
    return()=>clearTimeout(timer);
  },[scene]);

  async function next() {
    if(advancing.current)return;
    void unlockAudio(); playLegacySe('click'); setError('');
    const trimmed=name.trim();
    if(scene==='name'&&(!trimmed||[...trimmed].length>8||/[\p{Cc}\p{Cf}]/u.test(trimmed))) {
      setError('名前は1〜8文字で入力してください。');return;
    }
    advancing.current=true;setPending(true);
    try {
      if(scene==='name')setName(trimmed);
      await live?.advance(scene,trimmed);
      if(scene==='formation'&&!live)setSave(current=>advanceTutorial(current,{type:'next',step:current.step},'opening-equip'));
      const index=IDS.indexOf(scene);
      if(live&&scene==='name'&&(live.state.tutorial?.step??0)>=14)setScene('farewell');
      else if(index<IDS.length-1)setScene(IDS[index+1]);
    } catch(reason) {
      const failure=tutorialFailure(reason,scene==='farewell');
      if(failure.duplicate){setScene('name');setError('この名前は既に登録済です。別の名前を入力してください。');}
      else setError(failure.message);
    } finally {advancing.current=false;setPending(false);}
  }
  function restart() {
    setName('');setError('');setSave(preparation());setRun(value=>value+1);setScene('world');
  }
  const texts:Partial<Record<Scene,string>>={
    world:'―時は戦国―\n女が闘い、男は守る\nそんな時代だった―',
    challenge:'追い詰めたぞ！信長！\n天下はわしのものじゃ！',
    oda:'我は魔王信長なり！\n向かってくる者には容赦せぬ！',
    need:'……このままでは信長には勝てぬ……\n優秀な軍師が必要じゃ……',
    osaka:'大阪城―',
    name:'わしが豊臣秀吉じゃ！\nそなたが新しい軍師じゃな！\n名はなんと言う？',
    recruit:name+'か、あいわかった。\n既に聞き及んでおろうが、天下統一のため、優秀な軍師を求めておる。',
    test:'出自は問わぬが、腕前は確認させてもらう。\n早速模擬戦の準備ができておるので、腕前を見せてみよ。',
    formation:'模擬戦はこの3人で行うが良い。\n武将の力を引き出すための戦技もわしが選んでおいた。まずは編成じゃ。',
    ready:'見事な編成じゃ。じゃが、相手の伊達は手強い。\n戦中に「バースト」が発動すれば、攻撃の戦技を連発できる。その力、見届けるのじゃ。さぁ、開戦じゃ！',
    farewell:'見事であった！これなら戦を任せられるであろう。\nまずは三河の地の平定に向かってくれ。'+name+'よ！戦果を楽しみにしておるぞ！'
  };
  const black=['world','need','blackout','complete'].includes(scene);
  const cast=scene==='oda'?'char_reiji_01':'char_ageha_01';
  const showCast=!black&&scene!=='osaka'&&scene!=='formation';
  const auto=scene==='blackout'||scene==='osaka';
  const label=scene==='name'?'この名で軍師になる':scene==='formation'?'おまかせ編成・戦技':scene==='ready'?'模擬戦を始める':scene==='farewell'?'チュートリアルを終える':'次へ';

  return <div className="rd-shell tutorial-shell opening-shell" data-opening-scene={scene} key={run}>
    {scene==='trailer'?<BattleView result={trailer} vipActive={false} requirePlaybackCompletion autoCompleteOnFinish hideWaveDisplay title="魔王・織田信長 Lv.100" backgroundSrc={BACKGROUNDS.oda} onComplete={()=>setScene('need')}/>:
     scene==='practice'&&practice?<BattleView result={practice} vipActive={false} requirePlaybackCompletion hideWaveDisplay title="模擬戦" onPlaybackComplete={live?()=>live.advance('practice',name):undefined} backgroundSrc={BACKGROUNDS.battle} onComplete={()=>setScene('farewell')}/>:
     scene==='complete'?<main className="opening-complete"><h1>チュートリアル終了</h1><p>{name}の軍師としての旅が始まります。</p><p className="opening-note">ここまでが今回の確認範囲です。確認用の名前・武将・戦技は通常プレイには反映されません。</p><ActionButton variant="primary" onClick={restart}>最初から確認する</ActionButton></main>:
     <main key={scene} className={'tutorial-scene opening-scene'+(black?' opening-black':'')+(scene==='world'?' opening-world':'')} style={black?undefined:{backgroundImage:"linear-gradient(0deg, #160f0baa, transparent 65%), url('"+(['challenge','oda'].includes(scene)?BACKGROUNDS.oda:OSAKA)+"')"}}>
       {scene==='world'?<div className="opening-world-copy"><p>{texts.world}</p></div>:
        showCast?<div className="tutorial-cast is-cowboy opening-cast"><CowboyDisplay characterId={cast} name={member(cast).name}/></div>:
        scene==='formation'?<div className="opening-roster">
          <div className="opening-characters">{STARTERS.map(id=><figure key={id}><CharacterCard subject={member(id)} compact hideMarks className="tutorial-character-card"/><figcaption>{id==='char_aoi_01'?'お市':member(id).name}</figcaption></figure>)}</div>
          <div className="opening-skills">{STARTER_SKILLS.map(id=>{const skill=getFormalOwnedSkill(id,0);return <figure key={id}><AssetIcon src={skill.image} name={skill.name}/><figcaption>{skill.name}</figcaption></figure>;})}</div>
        </div>:<div className="opening-spacer"/>}
       {scene!=='blackout'&&<section className={'tutorial-copy opening-copy'+(scene==='world'?' opening-world-action':'')} aria-live="polite">
         {!['world','osaka'].includes(scene)&&<h1>{scene==='oda'?'織田信長':'豊臣秀吉'}</h1>}
         {scene!=='world'&&<p>{texts[scene]}</p>}
         {scene==='name'&&<form id="strategist-name" onSubmit={event=>{event.preventDefault();next();}}><label htmlFor="strategist-input">軍師名（1〜8文字）</label><input id="strategist-input" autoComplete="off" placeholder="軍師名を入力" value={name} onChange={event=>{setName(event.target.value);setError('');}} maxLength={16}/></form>}
         {error&&<p role="alert">{error}</p>}
         {!auto&&<ActionButton variant="primary" className="tutorial-next" busy={pending} busyLabel="保存中" disabled={pending||(scene==='name'&&(!name.trim()||[...name.trim()].length>8))} onClick={next}>{label}</ActionButton>}
       </section>}
     </main>}
  </div>;
}
