'use client';
import { useState } from 'react';
import { AudioProvider } from '@/audio/AudioProvider';
import type { BattleResult } from '@/domain/redesign/battle';
import BattleView from '@/app/components/redesign/BattleView';

export default function BattleReplayFixture({ result, vipActive = true }: { result: BattleResult; vipActive?: boolean }) {
  const [frame, setFrame] = useState(0);
  const [generation, setGeneration] = useState(0);
  return <>
    <div style={{ margin: '12px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <label style={{ minWidth: 0, flex: '1 1 180px' }}>記録フレーム<select style={{ width: '100%', color: '#edd5b3', background: '#211b20' }} value={frame} onChange={event => { setFrame(Number(event.target.value)); setGeneration(value => value + 1); }}>{result.frames.map((entry, index) => <option value={index} key={entry.index}>#{index + 1} W{entry.wave} {entry.text.slice(0, 70)}</option>)}</select></label>
      <button onClick={() => { setFrame(0); setGeneration(value => value + 1); }}>最初へ戻す</button>
    </div>
    <AudioProvider><BattleView key={generation} result={result} vipActive={vipActive} initialFrame={frame} initialPaused onComplete={() => { setFrame(0); setGeneration(value => value + 1); }} title="共通戦闘ルール・検証リプレイ" /></AudioProvider>
  </>;
}
