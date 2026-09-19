"use client";
import React, { useEffect, useRef } from "react";
import { useGame } from "../../context/GameContext";
import { CANONICAL_EQUIPMENT_VIEW } from "@/utils/equipments_master_data";
import { CHARACTERS_MASTER } from "@/utils/game_constants";
import CharacterPresentation from "../character/CharacterPresentation";
import { getAcquisitionBadgeAsset, getRarityFrameAsset } from "@/utils/rarityAssets";
import { GACHA_RARITY_ASSETS } from "../../lib/screenManifests";
import { preloadAssetManifest } from "../../lib/screenAssets";
import { getCharacterLocationBackground } from "@/utils/characterVisualAssets";
import "../CommonModals.css";
import { userFacingErrorMessage } from "../../lib/userFacingError";
import CharacterGachaPresentation from "../gacha/CharacterGachaPresentation";
import CanonicalDialog from "../ui/CanonicalDialog";
import { LoginBonusModal } from "../LoginBonusModal";
import ConfirmDialog from "../ui/ConfirmDialog";
import GlobalInteractionBlocker from "../ui/GlobalInteractionBlocker";
function gachaLocationBackground(result: any): string {
 const master = CHARACTERS_MASTER.find((character: any) => character.id === result?.characterId);
 return getCharacterLocationBackground(master?.homeTown);
}
/** Reuse purchase/result infrastructure without legacy guild, PvP, gear or tutorial overlays. */
export default function RedesignCommerceOverlays() {
 const { scoutAnimationState, setScoutAnimationState, scoutFlashingColor, scoutResults, scoutPresentationCategory,
 showLoginBonusModal, setShowLoginBonusModal, loginBonusMasters, userLoginBonus, loginBonusClaimResult, setShowInboxPanel, setInboxPanelTab, errorMessage, setErrorMessage, playCyberSe, playSe, confirmDialogConfig, globalInteractionBlocking } = useGame();
  const announcedScoutResultRef = useRef<any[] | null>(null);
  const [tutorialPullStarted, setTutorialPullStarted] = React.useState(false);
  const [tutorialPullBurst, setTutorialPullBurst] = React.useState(false);
  const isCharacterReveal = scoutResults.length > 0
    && scoutResults.every((result: any) => result?.type === "CHARACTER" && result?.characterId);
  const isCommonOpening = scoutAnimationState === "PROCESSING"
    || scoutAnimationState === "FLASHING"
    || scoutAnimationState === "READY";
  useEffect(() => {
    if (isCharacterReveal || scoutAnimationState !== "SHOW_RESULTS" || announcedScoutResultRef.current === scoutResults) return;
    announcedScoutResultRef.current = scoutResults;
    playSe("GACHA_REVEAL");
    const rarities = scoutResults.map((result: any) => String(result.rarity || "").toUpperCase());
    if (!rarities.includes("SSR") && rarities.includes("SR")) playSe("GACHA_SR");
  }, [isCharacterReveal, playSe, scoutAnimationState, scoutResults]);

  useEffect(() => {
    if (scoutAnimationState === null) {
      announcedScoutResultRef.current = null;
      setTutorialPullStarted(false);
      setTutorialPullBurst(false);
    }
  }, [scoutAnimationState]);

  useEffect(() => {
    if (scoutAnimationState === null) return;
    void preloadAssetManifest(GACHA_RARITY_ASSETS.map((src) => ({ src, required: false })));
  }, [scoutAnimationState]);

  useEffect(() => {
    if (isCharacterReveal || scoutAnimationState !== "READY" || !tutorialPullStarted) return;
    setTutorialPullBurst(true);
    const timer = window.setTimeout(() => setScoutAnimationState("SHOW_RESULTS"), 620);
    return () => window.clearTimeout(timer);
  }, [isCharacterReveal, scoutAnimationState, setScoutAnimationState, tutorialPullStarted]);

  const compactGachaOutcome = (result: any) => {
    const outcome = String(result.convertReward || "");
    if (outcome === "新規獲得") return "NEW";
    if (outcome.includes("覚醒")) return outcome.replace("段階", " ");
    if (result.converted || outcome.includes("抗争の掟")) return "重複 / 掟+1";
    if (outcome.includes("限界突破")) return outcome;
    return outcome || "獲得";
  };
  const assetProgressionLevel = (result: any) => {
    const projectedLevel = Math.trunc(Number(result.progressionLevel));
    if (Number.isFinite(projectedLevel) && projectedLevel > 0) return projectedLevel;
    const match = String(result.convertReward || "").match(/限界突破\s*\+(\d+)/);
    return match ? Number(match[1]) : null;
  };

 return <>
 {showLoginBonusModal && <LoginBonusModal masters={loginBonusMasters} currentStep={userLoginBonus?.current_step || 1} claimResult={loginBonusClaimResult} onClose={() => setShowLoginBonusModal(false)} onOpenPresents={() => { setShowLoginBonusModal(false); setInboxPanelTab('presents'); setShowInboxPanel(true); }} />}
      {/* 🎰 ガチャ演出モーダル (FLASHING / SHOW_RESULTS) */}
      {scoutAnimationState !== null && isCharacterReveal && (scoutAnimationState === "READY" || scoutAnimationState === "SHOW_RESULTS") ? (
        <CharacterGachaPresentation results={scoutResults} tutorial={false}
          onReveal={() => setScoutAnimationState("SHOW_RESULTS")} playSound={playSe}
          onClose={() => { setScoutAnimationState(null); playCyberSe("click");  }} />
      ) : scoutAnimationState !== null && (scoutPresentationCategory === "CHARACTER" || isCharacterReveal) ? (
        <div className="cg-overlay"><div className="cg-loading" role="status" aria-label="ガチャ演出を準備中"><i className="cg-loading-spinner" aria-hidden="true" /></div></div>
      ) : scoutAnimationState !== null && (
        <div className={`modal-overlay background-black-95 ${isCommonOpening ? "gacha-processing-overlay gacha-common-opening-overlay" : ""}`} style={{ zIndex: 20000 }} data-gacha-transition-state={scoutAnimationState.toLowerCase()} data-gacha-visual={isCommonOpening ? "tokyo-night-opening" : undefined}>
          {scoutAnimationState === "PROCESSING" || scoutAnimationState === "FLASHING" || scoutAnimationState === "READY" ? (
            <div className={`gacha-opening-stage rarity-${scoutFlashingColor.toLowerCase()} ${scoutAnimationState === "READY" ? "is-ready" : "is-processing"} ${tutorialPullStarted ? "is-pull-started" : ""} ${tutorialPullStarted && scoutFlashingColor === "GOLD" && !isCharacterReveal ? "is-ssr-presence" : ""}`} data-gacha-common-opening>
              <div className="gacha-opening-city" aria-hidden="true" />
              <div className="gacha-opening-neon" aria-hidden="true"><i /><i /><i /></div>
              {scoutAnimationState === "READY" && !tutorialPullStarted ? (
                <button
                  type="button"
                  className="gacha-opening-logo-gate"
                  onClick={() => {
                    setTutorialPullStarted(true);
                    playCyberSe("click");
                  }}
                  aria-label="戦国姫艶武 ガチャ結果を開く"
                  data-gacha-logo-gate
                >
                  <img src="/branding/tribe-neon-logo.png" alt="戦国姫艶武" />
                  <span>TAP!</span>
                </button>
              ) : scoutAnimationState === "READY" ? (
                <div className={`gacha-opening-release ${tutorialPullBurst ? "is-ready" : ""}`} role="status" aria-label="ガチャ結果を表示中">
                  <img src="/branding/tribe-neon-logo.png" alt="" aria-hidden="true" />
                  <i />
                </div>
              ) : (
                <div className="gacha-opening-status" role="status" aria-live="polite" aria-label="ガチャ抽選結果を同期中" data-gacha-short-effect>
                  <small>抽選中…</small>
                </div>
              )}
            </div>
          ) : (
            <div className="gacha-result-panel">
              <header className="gacha-result-heading">
                <h3>ガチャ結果</h3>
                <p>{scoutResults.length}件の獲得結果</p>
              </header>

              <div className={`gacha-result-grid custom-scrollbar ${isCharacterReveal ? "is-character-results" : "is-asset-results"} ${scoutResults.length >= 10 ? "is-ten-pull" : ""}`}>
                {scoutResults.map((res: any, idx: number) => (
                  <article
                    key={`${res.name}-${idx}`}
                    data-acquisition={res.convertReward === "新規獲得" ? "NEW" : "DUPLICATE"}
                    data-ssr-glint={res.type === "CHARACTER" && String(res.rarity).toUpperCase() === "SSR" ? "enabled" : undefined}
                    style={{ "--gacha-result-glint-delay": `${(idx % 5) * -0.17}s` } as React.CSSProperties}
                    className={`gacha-result-card rarity-${String(res.rarity).toLowerCase()} ${res.convertReward === "新規獲得" ? "is-new" : "is-duplicate"}`}
                  >
                    {res.type === "CHARACTER" && res.imageUrl ? (
                      <CharacterPresentation
                        src={res.imageUrl}
                        alt={res.name}
                        variant="gacha-result-compact"
                        rarity={res.rarity}
                        attribute={res.attributeKey}
                        backgroundSrc={gachaLocationBackground(res)}
                        frameKind="character"
                        rarityBadge
                        attributeBadge
                      />
                    ) : (
                      res.assetPath || (res.type === "EQUIPMENT" && CANONICAL_EQUIPMENT_VIEW.find((item) => item.id === (res.equipmentId || res.itemId))) ? (
                        <div className={`gacha-result-asset-art is-${String(res.type).toLowerCase()}`}>
                          <img className="gacha-result-item-asset" src={res.assetPath || CANONICAL_EQUIPMENT_VIEW.find((item) => item.id === (res.equipmentId || res.itemId))?.assetPath} alt={res.name} />
                          <img
                            className="gacha-result-rarity-frame"
                            src={getRarityFrameAsset(res.type === "SKILL" ? "skill" : "equipment", res.rarity)}
                            alt={`${res.rarity}レアリティフレーム`}
                          />
                          {res.convertReward === "新規獲得" ? (
                            <img className="gacha-result-asset-badge is-new" src={getAcquisitionBadgeAsset("NEW") || ""} alt="NEW" />
                          ) : assetProgressionLevel(res) ? (
                            <span className="gacha-result-asset-badge is-progression" aria-label={`限界突破 +${assetProgressionLevel(res)}`}>
                              <b>+{assetProgressionLevel(res)}</b>
                            </span>
                          ) : null}
                        </div>
                      ) : <div className="gacha-result-asset-placeholder"><span>{res.type === "SKILL" ? "スキル" : "装備"}</span><strong>{res.name}</strong></div>
                    )}
                    {res.type !== "CHARACTER" && <div className="gacha-result-name" title={res.name}>{res.name}</div>}
                    {res.type === "CHARACTER" && getAcquisitionBadgeAsset(res.convertReward === "新規獲得" ? "NEW" : "AWAKENING", res.awakeningLevel) && (
                      <img className="gacha-result-acquisition-badge" src={getAcquisitionBadgeAsset(res.convertReward === "新規獲得" ? "NEW" : "AWAKENING", res.awakeningLevel) || ""} alt={compactGachaOutcome(res)} />
                    )}
                  </article>
                ))}
              </div>

              <button
                className="gacha-result-next semantic-cta semantic-cta--primary active-scale-effect"
                onClick={() => {
                  setScoutAnimationState(null);
                  playCyberSe("click");
                }}
              >
                ガチャへ戻る
              </button>
            </div>
          )}
        </div>
      )}

      {/* ❌ 汎用エラーモーダル */}
      {errorMessage && (
        <CanonicalDialog title="エラー" onClose={() => setErrorMessage(null)} actions={[{ label: "閉じる", semantic: "secondary", onClick: () => setErrorMessage(null) }]}>
          {userFacingErrorMessage(errorMessage)}
        </CanonicalDialog>
      )}

{confirmDialogConfig && <ConfirmDialog key={confirmDialogConfig.dialogId} {...confirmDialogConfig} presentation="canonical" />}
<GlobalInteractionBlocker isBlocking={globalInteractionBlocking} />
</>;
}
