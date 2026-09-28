'use client';

import { useEffect, useMemo, useState } from 'react';
import BattleView from '@/app/components/redesign/BattleView';
import { createTutorialTrailerBattle } from '@/domain/redesign/tutorial/trailer';
import '@/app/components/redesign/redesign.css';

export default function TutorialTrailerPreview() {
  const [replay, setReplay] = useState(0);
  const [finished, setFinished] = useState(false);
  const result = useMemo(() => createTutorialTrailerBattle(), [replay]);

  useEffect(() => {
    document.body.classList.add('rd-active');
    return () => document.body.classList.remove('rd-active');
  }, []);

  return <main style={{ minHeight: '100dvh', background: '#020205' }}>
    {finished ? <section className="g4-entry-state" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: '#020205', color: '#f4e4c9' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ opacity: 0.7 }}>―― 戦場は静まり返った。</p>
        <h1>「……軍師が必要だ。」</h1>
        <p>本実装ではここから既存チュートリアルの豊臣との出会い・軍師名入力へ接続します。</p>
        <button className="rd-button" onClick={() => { setFinished(false); setReplay(value => value + 1); }}>もう一度見る</button>
      </div>
    </section> : <BattleView
      key={replay}
      result={result}
      vipActive={false}
      requirePlaybackCompletion
      hideWaveDisplay
      autoCompleteOnFinish
      title="魔王・織田信長 Lv.100"
      backgroundSrc="/bg/approved-20260925/ssr-char_reiji_01.webp"
      onComplete={() => setFinished(true)}
    />}
  </main>;
}
