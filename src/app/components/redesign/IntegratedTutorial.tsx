'use client';
import { useEffect,useMemo,useState } from 'react';
import { useAudio } from '@/audio/AudioProvider';
import { CHARACTER_MASTERS } from '@/domain/redesign/masters';
import { getFormalOwnedSkill } from '@/domain/redesign/formalOwnedSkills';
import { characterArt } from '@/theme/creativeAssets';
import { BACKGROUNDS,SCENES,STARTERS,STARTER_SKILLS } from '@/domain/redesign/tutorial/content';
import { createTutorialBattle } from '@/domain/redesign/tutorial/battle';
import type { RedesignState } from '@/domain/redesign/types';
import BattleView from './BattleView';
import HomeEffect from './HomeEffect';
import TutorialSceneAssets from '@/app/qa/tutorial/TutorialSceneAssets';
import CowboyDisplay from './visual-bench/CowboyDisplay';
import TypewriterText from './TypewriterText';
import { TUTORIAL_ASSETS } from '@/app/qa/tutorial/assets';
import '@/app/qa/tutorial/tutorial.css';
const castMember=(id:string)=>CHARACTER_MASTERS.find(c=>c.id===id)!;
export default function IntegratedTutorial({state,busy,onNext}:{state:RedesignState;busy:boolean;onNext:(step:number,name:string)=>Promise<unknown>}) {
 const save=state.tutorial!;
 const [name,setName]=useState(save.name),[error,setError]=useState('');
 const practice=useMemo(()=>state.deck.length?createTutorialBattle(state):null,[state]);
 useEffect(()=>{document.body.classList.add('rd-active');return()=>document.body.classList.remove('rd-active');},[]);
 const scene=SCENES[save.step];
 const { playBgm } = useAudio();
 useEffect(() => { if (scene.id !== 'battle') playBgm('TITLE'); }, [scene.id, playBgm]);
 const world=scene&&'cast' in scene;
 const acquisition=scene?.id==='characters'||scene?.id==='skills';
 const background=world?scene.background:BACKGROUNDS.guide;
 const cast=world?scene.cast:['char_ageha_01'];
 const [revealedScene,setRevealedScene]=useState('');
 const revealed = revealedScene === scene.id;
 const reveal = () => setRevealedScene(scene.id);
 const next=()=>{setError('');void onNext(save.step,name).catch(e=>setError(e.message));};
 return <TutorialSceneAssets assets={TUTORIAL_ASSETS}><div className="rd-shell tutorial-shell">
 {scene.id === 'battle' && practice ? <BattleView requirePlaybackCompletion result={practice} vipActive={false} onComplete={next} title="模擬戦" backgroundSrc={BACKGROUNDS.battle} /> :
      <main key={scene.id} className={`tutorial-scene ${world ? 'is-world' : ''}`} style={{ backgroundImage: `linear-gradient(0deg, #160f0beb, transparent 65%), url('${background}')` }} data-scene={scene.id}>
        {world && <HomeEffect effectId={scene.effectId} />}
        <div className={`tutorial-cast count-${cast.length} ${!world && !acquisition ? 'is-cowboy' : ''}`} aria-label={world ? '乱世の武将たち' : '豊臣秀吉'}>
          {!acquisition && cast.map(id => !world ? <CowboyDisplay key={id} characterId={id} name={castMember(id).name} /> : <img key={id} src={characterArt(castMember(id), 'full')} alt={castMember(id).name} />)}
          {scene.id === 'characters' && <div className="tutorial-rewards">{STARTERS.map(id => <figure key={id}><div className="tutorial-card-art"><img src={characterArt(castMember(id), 'card')} alt={castMember(id).name} /><img className="tutorial-card-frame" src="/creative/ui/frame-R.png" alt="" /></div><figcaption><b>{id === 'char_aoi_01' ? 'お市' : castMember(id).name}</b><span>R　Lv.1・覚醒0</span></figcaption></figure>)}</div>}
          {scene.id === 'skills' && <div className="tutorial-rewards is-skills">{STARTER_SKILLS.map(id => { const skill = getFormalOwnedSkill(id, 0); return <figure key={id}><div className="tutorial-skill-art"><img src={skill.image} alt={skill.name} /></div><figcaption><b>{skill.name}</b><span>{skill.rarity}　LB0</span></figcaption></figure>; })}</div>}
        </div>
        <section className="tutorial-copy" aria-live="polite">
          {!world && !acquisition && !['name', 'equipped'].includes(scene.id) && <h1>豊臣秀吉</h1>}
          <TypewriterText key={scene.id} text={scene.text.replace('〇〇', save.name)} revealed={revealed} onFinished={reveal} />
          {scene.id === 'name' && <label>名前（1〜8文字）<input autoComplete="off" placeholder="名前を入力" value={name} onChange={e => setName(e.target.value)} maxLength={16} /></label>}
          {world && <div className="tutorial-progress" aria-label={`${save.step + 1} / 3`}>{[0, 1, 2].map(i => <i key={i} data-active={save.step === i} />)}</div>}
          <button className="rd-button tutorial-next" disabled={busy || (scene.id === 'name' && (!name.trim() || [...name.trim()].length > 8))} onClick={() => revealed ? next() : reveal()}>{'button' in scene ? scene.button : '次へ'}</button>
        </section>
      </main>}
 {error&&<p className="rd-panel" role="alert">{error}</p>}
 </div></TutorialSceneAssets>;
}
