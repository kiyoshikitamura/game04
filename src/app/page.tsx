"use client";
import { GameProvider, useGame } from "./context/GameContext";
import { AudioProvider } from "@/audio/AudioProvider";
import TitleView from "./components/TitleView";
import AuthView from "./components/AuthView";
import SetupView from "./components/SetupView";
import BrandedLoading from "./components/ui/BrandedLoading";
import RedesignApp from "./components/redesign/RedesignApp";
import { useCallback, useEffect, useState } from "react";
import RedesignBillingReturn from "./components/redesign/RedesignBillingReturn";
import RedesignCommerceOverlays from "./components/redesign/RedesignCommerceOverlays";
import { initializeAcquisitionAttribution } from "@/utils/acquisitionAttribution";

function AppContent() {
  const game = useGame();
  const [billingRevision, setBillingRevision] = useState(0);
  const [initialTab, setInitialTab] = useState('home');
  const billingGranted = useCallback(() => { setInitialTab('shop'); setBillingRevision(value => value + 1); }, []);
  const billingReturn = useCallback(() => { setInitialTab('shop'); }, []);
  useEffect(() => { void initializeAcquisitionAttribution(); }, []);
  if (game.showTitleView) return <div className="app-container"><TitleView /></div>;
  if (game.authLoading) return <div className="app-container"><BrandedLoading label="認証状態を確認中" /></div>;
  if (!game.session) return <div className="app-container"><AuthView /></div>;
  if (game.isSetupRequired) return <div className="app-container"><SetupView /></div>;
  if (!game.authenticatedProjectionReady) return <div className="app-container"><BrandedLoading label="プレイヤーデータを確認中" />{game.authenticatedProjectionError && <><p role="alert">{game.authenticatedProjectionError}</p><button onClick={() => void game.retryAuthenticatedProjection()}>再試行</button></>}</div>;
  if (game.maintenanceEnabled) return <div className="app-container"><p>現在メンテナンス中です。</p></div>;
  return <><RedesignApp key={`${game.session.user.id}:${initialTab}:${billingRevision}`} initialTab={initialTab} /><RedesignBillingReturn onGranted={billingGranted} onReturn={billingReturn} /><RedesignCommerceOverlays /></>;
}
export default function Home() { return <AudioProvider><GameProvider><AppContent /></GameProvider></AudioProvider>; }
