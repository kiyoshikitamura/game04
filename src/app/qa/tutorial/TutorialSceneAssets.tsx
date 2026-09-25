'use client';
import { useEffect, useState, type ReactNode } from 'react';
import BrandedLoading from '@/app/components/ui/BrandedLoading';
import { isBattleImageReady, preloadBattleImages } from '@/app/components/battle/battleAssetPreload';

/** One entry gate for the complete tutorial bundle; never remounted on a scene tap. */
export default function TutorialSceneAssets({ assets, children }: { assets: string[]; children: ReactNode }) {
  const key = JSON.stringify(assets);
  const [readyKey, setReadyKey] = useState(() => assets.every(isBattleImageReady) ? key : '');
  const ready = readyKey === key || assets.every(isBattleImageReady);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    preloadBattleImages(JSON.parse(key) as string[]).then(() => {
      if (active) setReadyKey(key);
    }, () => { if (active) setError(true); });
    return () => { active = false; };
  }, [key, attempt]);
  if (!ready) return <><BrandedLoading />{error && <div className="tutorial-load-error" role="alert"><p>画像を読み込めませんでした。</p><button onClick={() => { setError(false); setAttempt(value => value + 1); }}>再試行</button></div>}</>;
  return children;
}

