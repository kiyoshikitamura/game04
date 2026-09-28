'use client';
import { useEffect, useState, type ReactNode } from 'react';
import BrandedLoading from '@/app/components/ui/BrandedLoading';
import { isBattleImageReady, preloadBattleImages } from '@/app/components/battle/battleAssetPreload';

/** Decode the current scene first; a future scene must never delay this one. */
export default function TutorialSceneAssets({ assets, nextAssets = [], children }: { assets: string[]; nextAssets?: string[]; children: ReactNode }) {
  const key = JSON.stringify(assets);
  const nextKey = JSON.stringify(nextAssets);
  const [readyKey, setReadyKey] = useState(() => assets.every(isBattleImageReady) ? key : '');
  const ready = readyKey === key || assets.every(isBattleImageReady);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true; setError(false);
    preloadBattleImages(JSON.parse(key) as string[]).then(() => {
      if (active) setReadyKey(key);
    }, () => { if (active) setError(true); });
    return () => { active = false; };
  }, [key, attempt]);
  useEffect(() => {
    if(!ready)return;
    // Schedule after paint. Background failures are retried by that scene's gate.
    const timer=setTimeout(()=>{void preloadBattleImages(JSON.parse(nextKey)).catch(()=>{});},150);
    return ()=>clearTimeout(timer);
  }, [ready,nextKey]);
  if (!ready) return <><BrandedLoading />{error && <div className="tutorial-load-error" role="alert"><p>画像を読み込めませんでした。</p><button onClick={() => { setError(false); setAttempt(value => value + 1); }}>再試行</button></div>}</>;
  return children;
}

