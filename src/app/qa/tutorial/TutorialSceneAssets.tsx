'use client';
import { useEffect, useState, type ReactNode } from 'react';
import Modal from '@/app/components/redesign/Modal';
import { isBattleImageReady, preloadBattleImage } from '@/app/components/battle/battleAssetPreload';

/** Mount the scene only after every background, character and reward image is decoded. */
export default function TutorialSceneAssets({ assets, children }: { assets: string[]; children: ReactNode }) {
  const key = JSON.stringify(assets);
  const [ready, setReady] = useState(() => assets.every(isBattleImageReady));
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all((JSON.parse(key) as string[]).map(preloadBattleImage)).then(() => {
      if (active) setReady(true);
    }, () => { if (active) setError(true); });
    return () => { active = false; };
  }, [key, attempt]);
  if (!ready) return <Modal title={error ? '画像を読み込めませんでした' : '読み込み中'} onClose={() => undefined} hideCloseButton closeDisabled className="tutorial-notice"
    footer={error ? <button className="rd-button tutorial-next" onClick={() => { setError(false); setAttempt(value => value + 1); }}>再試行</button> : undefined}>
    <p role="status">{error ? '通信状況を確認して、もう一度お試しください。' : '画面を準備しています…'}</p>
  </Modal>;
  return children;
}
