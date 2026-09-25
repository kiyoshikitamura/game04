'use client';
import { useState } from 'react';
import { AudioProvider } from '@/audio/AudioProvider';
import IntegratedTutorial from '@/app/components/redesign/IntegratedTutorial';
import { createInitialState } from '@/domain/redesign/masters';
import { applyTutorialTransition } from '@/domain/redesign/tutorial/integration';
import { SCENES, TUTORIAL_VERSION } from '@/domain/redesign/tutorial/content';
import '@/app/components/redesign/redesign.css';

/** Local presentation fixture. No auth, API, rewards or saved player data. */
function initial() {
  const state = createInitialState('device-debug-local');
  Object.assign(state, { characters: [], skills: [], deck: [] });
  state.tutorial = { version: TUTORIAL_VERSION, step: 0, name: '確認', homeVisits: 0, departed: false, loginEligible: false, defeatSeen: false, defeatPending: false };
  return state;
}
export default function DeviceDebugFixture() {
  const [state, setState] = useState(initial);
  return <AudioProvider>{state.tutorial!.step < SCENES.length ? <IntegratedTutorial state={state} busy={false} onNext={async (step, name) => setState(previous => applyTutorialTransition(previous, 'tutorial_next', { step, name }))} /> : <p>確認終了</p>}
    <select aria-label="検証シーン" style={{position:'fixed',top:0,right:0,zIndex:31000,maxWidth:120}} value={state.tutorial!.step} onChange={event => {
      let next = initial();
      for(let step = 0; step < Number(event.target.value); step++) next = applyTutorialTransition(next, 'tutorial_next', {step, name:'確認'});
      setState(next);
    }}>{SCENES.map((scene, i) => <option key={scene.id} value={i}>{scene.id}</option>)}</select>
  </AudioProvider>;
}
