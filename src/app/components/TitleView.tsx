"use client";
import { displayImage } from '@/theme/displayImages';
import ActionButton from './ui/ActionButton';
import BrandedLoading from './ui/BrandedLoading';
import React, { useEffect, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import "./TitleView.css";
import { markTitleAssetReady } from "../lib/screenAssets";
import ConfirmDialog from "./ui/ConfirmDialog";
import TitleLegalFooter from "./TitleLegalFooter";
import HomeEffect from "./redesign/HomeEffect";
import { recordTitleArrival } from '@/utils/titleArrival';
import { recordAcquisitionObservation } from "@/utils/kpiInstrumentation";
import { recordPortalEntry } from '@/utils/portalActivity';
import { useTitleOnline } from './useTitleOnline';
import { onlinePresentation } from '@/utils/titleOnline';
import { recordTitleProofEvent } from '@/utils/titleProofEvents';

export default function TitleView() {
  const { showTitleView, setShowTitleView, authLoading, setupLoading, resumeLoading, resumeCurrentSession, session, onboardingState, errorMessage, playBgm, playCyberSe, handleFirstUserInteraction, handleStartNewGame, handleLogout, confirmDialogConfig } = useGame();
  const [entryActivated, setEntryActivated] = useState(false);
  const [isGameStartTransition, setIsGameStartTransition] = useState(false);
  const gameStartRef = useRef(false);
  const titleArrivalId = useRef<string | null>(null);
  const proofVisit = useRef<string | null>(null);
  const selectionId = useRef<string | null>(null);
  const proofState = useRef('');
  const online = useTitleOnline(showTitleView && !isGameStartTransition && !resumeLoading);
  const proof = onlinePresentation(online.count);
  const [proofPrefix, proofNumber, proofSuffix] = proof.text.split(/(\d+)/);
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

  useEffect(() => {
    if (!showTitleView && !titleArrivalId.current) return;
    const record = () => {
      if (document.visibilityState !== 'visible') return;
      titleArrivalId.current ??= crypto.randomUUID();
      void recordTitleArrival(titleArrivalId.current);
    };
    record();
    if (showTitleView) document.addEventListener('visibilitychange', record);
    return () => document.removeEventListener('visibilitychange', record);
  }, [showTitleView, session?.user?.id]);

  useEffect(() => {
    if (!showTitleView) { proofVisit.current = null; selectionId.current = null; proofState.current = ''; return; }
    proofVisit.current ??= crypto.randomUUID();
    if (!proofState.current) {
      recordTitleProofEvent(proofVisit.current, 'TITLE_ARRIVED', online, canStartNewGame, null);
      proofState.current = 'arrived';
    }
    if (!entryActivated || isGameStartTransition || resumeLoading || document.visibilityState !== 'visible') return;
    const state = JSON.stringify([online, canStartNewGame]);
    if (!selectionId.current) {
      selectionId.current = crypto.randomUUID();
      recordTitleProofEvent(proofVisit.current, 'SELECTION_VIEWED', online, canStartNewGame, selectionId.current);
    } else if (proofState.current !== state) {
      recordTitleProofEvent(proofVisit.current, 'ONLINE_CHANGED', online, canStartNewGame, selectionId.current);
    }
    proofState.current = state;
  }, [showTitleView, entryActivated, online, canStartNewGame, isGameStartTransition, resumeLoading]);

  if (!showTitleView) return null;

  const activateEntry = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleFirstUserInteraction();
    playBgm("TITLE");
    playCyberSe("click");
    void recordAcquisitionObservation("TAP_TO_START");
    if (proofVisit.current) recordTitleProofEvent(proofVisit.current, 'TAP_TO_START', online, canStartNewGame, null);
    setEntryActivated(true);
  };

  const openContinue = async (event: React.MouseEvent) => {
    event?.stopPropagation();
    if (resumeLoading) return;
    if (proofVisit.current) recordTitleProofEvent(proofVisit.current, 'CONTINUE_TAPPED', online, canStartNewGame, selectionId.current);
    handleFirstUserInteraction();
    playCyberSe("click");
    if (session) { void recordPortalEntry(); await resumeCurrentSession(); }
    else window.location.assign("/auth/game04");
  };

  const beginNewGame = async (event: React.MouseEvent) => {
    event.stopPropagation();
    handleFirstUserInteraction();
    playCyberSe("click");
    if (authLoading || setupLoading) return;
    if (session) return;
    if (gameStartRef.current) return;
    if (proofVisit.current) recordTitleProofEvent(proofVisit.current, 'START_NEW_TAPPED', online, canStartNewGame, selectionId.current);
    gameStartRef.current = true;
    setIsGameStartTransition(true);
    const succeeded = await handleStartNewGame();
    if (succeeded) {
      void recordPortalEntry();
      setShowTitleView(false);
      return;
    }
    gameStartRef.current = false;
    setIsGameStartTransition(false);
  };

  return (
    <div className="title-view-overlay">
      <div className="title-view-container" style={{backgroundImage: `url("${displayImage('/creative/branding/sengoku-hime-enbu-key-visual-20260928-v4.png')}")`}}>
        {/* 桜_上田城：既存の透過演出をタイトル背景の上へ重ねる。 */}
        <HomeEffect effectId="char_kaede_01" />
        
        {isGameStartTransition || resumeLoading ? (
          <BrandedLoading />
        ) : <div className="title-view-content">
          <div className="title-tap-area">
            {!entryActivated ? (
              <button type="button" className="title-tap-text blink-animation" onClick={activateEntry}>TAP TO START</button>
            ) : <div className="title-entry-actions">
              {proof.visible && <div className="title-online-proof" role="status"><span aria-hidden="true">● </span>{proofPrefix}<span className="title-online-number">{proofNumber}</span>{proofSuffix}</div>}
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
