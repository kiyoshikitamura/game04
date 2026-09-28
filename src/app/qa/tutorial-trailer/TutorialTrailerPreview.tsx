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

  return <main style={{ minHeight: '100dvh', background: '#130e09' }}>
    {finished ? <section className="g4-entry-state" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <h1>トレイラー再生完了</h1>
        <p>この後は既存チュートリアルの「豊臣との出会い → 軍師名入力」へ接続します。</p>
        <button className="rd-button" onClick={() => { setFinished(false); setReplay(value => value + 1); }}>もう一度見る</button>
      </div>
    </section> : <BattleView
      key={replay}
      result={result}
      vipActive={false}
      requirePlaybackCompletion
      title="魔王・織田信長 Lv.100"
      backgroundSrc="/bg/approved-20260925/ssr-char_reiji_01.webp"
      onComplete={() => setFinished(true)}
    />}
  </main>;
}
