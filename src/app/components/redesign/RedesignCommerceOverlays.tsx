"use client";
import { useGame } from "../../context/GameContext";
import { userFacingErrorMessage } from "../../lib/userFacingError";
import CanonicalDialog from "../ui/CanonicalDialog";
import FormalLoginBonusModal from "./FormalLoginBonusModal";
import { LOGIN_BONUS_VERSION } from "@/domain/redesign/loginBonus";
import ConfirmDialog from "../ui/ConfirmDialog";
import GlobalInteractionBlocker from "../ui/GlobalInteractionBlocker";
/** GAME04 draws render through FormalGachaView. The old scout state has no
 * product caller (handleScout is only called by the unreachable GachaTab).
 * Preserve the active purchase/receipt/error/login overlays here. */
export default function RedesignCommerceOverlays() {
 const {showLoginBonusModal,setShowLoginBonusModal,userLoginBonus,loginBonusClaimResult,errorMessage,setErrorMessage,confirmDialogConfig,globalInteractionBlocking}=useGame();
 return <>
  {showLoginBonusModal&&(loginBonusClaimResult as {masterVersion?:string}|null)?.masterVersion===LOGIN_BONUS_VERSION&&<FormalLoginBonusModal currentStep={userLoginBonus?.current_step||1} totalLogins={userLoginBonus?.total_logins} onClose={()=>setShowLoginBonusModal(false)}/>}
  {errorMessage&&<CanonicalDialog title="エラー" onClose={()=>setErrorMessage(null)} actions={[{label:'閉じる',semantic:'secondary',onClick:()=>setErrorMessage(null)}]}>{userFacingErrorMessage(errorMessage)}</CanonicalDialog>}
  {confirmDialogConfig&&<ConfirmDialog key={confirmDialogConfig.dialogId} {...confirmDialogConfig} presentation="canonical"/>}
  <GlobalInteractionBlocker isBlocking={globalInteractionBlocking}/>
 </>;
}
