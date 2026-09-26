"use client";
import ActionButton from './ui/ActionButton';
import BrandedLoading from './ui/BrandedLoading';
import React, { useEffect, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import "./TitleView.css";
import { markTitleAssetReady } from "../lib/screenAssets";
import ConfirmDialog from "./ui/ConfirmDialog";
import TitleLegalFooter from "./TitleLegalFooter";
import HomeEffect from "./redesign/HomeEffect";
import { recordAcquisitionObservation } from "@/utils/kpiInstrumentation";

export default function TitleView() {
  const { showTitleView, setShowTitleView, authLoading, setupLoading, resumeLoading, resumeCurrentSession, session, onboardingState, errorMessage, playBgm, playCyberSe, handleFirstUserInteraction, handleStartNewGame, handleLogout, confirmDialogConfig } = useGame();
  const [entryActivated, setEntryActivated] = useState(false);
  const [isGameStartTransition, setIsGameStartTransition] = useState(false);
  const gameStartRef = useRef(false);
  const entryReady = !authLoading;
  // A restored session is the recoverable account authority. This includes an
  // anonymous player who has not entered a name yet; it must resume instead of
  // creating a second anonymous lifecycle.
  const canStartNewGame = entryReady && !session;
  const isAnonymousSession = Boolean(session?.user?.is_anonymous);
  const requiresEmailCompletion = Boolean(session
    && !isAnonymousSession
    && !onboardingState?.gameplay_authorized
    && onboardingState?.tutorial_step === "COMPLETE"
    && onboardingState?.auth_method === "EMAIL");
  const continueLabel = session
    ? requiresEmailCompletion
      ? "メール認証を完了"
      : isAnonymousSession && !onboardingState?.gameplay_authorized
      ? "チュートリアルを続ける"
      : "続きから"
    : "データをお持ちの方";

  useEffect(() => {
    if (showTitleView) {
      markTitleAssetReady();
      void recordAcquisitionObservation("TITLE_ARRIVED");
      setEntryActivated(false);
      setIsGameStartTransition(false);
      gameStartRef.current = false;
    }
  }, [showTitleView]);

  if (!showTitleView) return null;

  const activateEntry = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleFirstUserInteraction();
    playBgm("TITLE");
    playCyberSe("click");
    void recordAcquisitionObservation("TAP_TO_START");
    setEntryActivated(true);
  };

  const openContinue = async (event: React.MouseEvent) => {
    event?.stopPropagation();
    if (resumeLoading) return;
    handleFirstUserInteraction();
    playCyberSe("click");
    if (session) await resumeCurrentSession();
    else window.location.assign("/auth/game04");
  };

  const beginNewGame = async (event: React.MouseEvent) => {
    event.stopPropagation();
    handleFirstUserInteraction();
    playCyberSe("click");
    if (authLoading || setupLoading) return;
    if (session) return;
    if (gameStartRef.current) return;
    gameStartRef.current = true;
    setIsGameStartTransition(true);
    const succeeded = await handleStartNewGame();
    if (succeeded) {
      setShowTitleView(false);
      return;
    }
    gameStartRef.current = false;
    setIsGameStartTransition(false);
  };

  return (
    <div className="title-view-overlay">
      <div className="title-view-container">
        {/* 桜_上田城：既存の透過演出をタイトル背景の上へ重ねる。 */}
        <HomeEffect effectId="char_kaede_01" />
        
        {isGameStartTransition || resumeLoading ? (
          <BrandedLoading />
        ) : <div className="title-view-content">
          <div className="title-tap-area">
            {!entryActivated ? (
              <button type="button" className="title-tap-text blink-animation" onClick={activateEntry}>TAP TO START</button>
            ) : <div className="title-entry-actions">
              {canStartNewGame && <ActionButton variant="primary" className="title-entry-primary" onClick={(event) => void beginNewGame(event)} disabled={setupLoading} aria-busy={setupLoading}>はじめから</ActionButton>}
              {entryReady && <ActionButton variant={session ? "primary" : "secondary"} className={session ? "title-entry-primary" : "title-entry-secondary"} onClick={(event) => void openContinue(event)} disabled={resumeLoading}>{continueLabel}</ActionButton>}
              {entryReady && session && !isAnonymousSession && <ActionButton className="title-entry-secondary" onClick={(event) => { event.stopPropagation(); void handleLogout(); }}>ログアウト／別アカウント</ActionButton>}
              {!entryReady && <small className="title-entry-status" role="status">セッション確認中</small>}
              {errorMessage && <div className="title-entry-error" role="alert">{errorMessage}</div>}
            </div>}
          </div>
        </div>}

        <TitleLegalFooter />
        <ConfirmDialog key={confirmDialogConfig?.dialogId} {...confirmDialogConfig} presentation="canonical" />
      </div>
    </div>
  );
}
