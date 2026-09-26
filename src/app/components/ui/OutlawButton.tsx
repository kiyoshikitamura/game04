import React, { useContext, useRef, useState } from "react";
import "./OutlawButton.css";
import ActionButton from "./ActionButton";
import { GameContext } from "../../context/GameContext";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "neon";

interface OutlawButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
}

export default function OutlawButton({
  variant = "secondary",
  fullWidth = false,
  isLoading = false,
  loadingLabel,
  className = "",
  onClick,
  disabled,
  children,
  ...restProps
}: OutlawButtonProps) {
  const game = useContext(GameContext);
  const [actionPending, setActionPending] = useState(false);
  const actionPendingRef = useRef(false);
  const busy = isLoading || actionPending;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (actionPendingRef.current || disabled || isLoading) return;
    actionPendingRef.current = true;
    setActionPending(true);
    // デフォルトでクリック音を鳴らす（disabledでない場合）
    game?.playCyberSe?.("click");

    let result: unknown;
    try {
      result = onClick?.(e);
    } catch (error) {
      actionPendingRef.current = false;
      setActionPending(false);
      throw error;
    }

    const release = () => {
      actionPendingRef.current = false;
      setActionPending(false);
    };
    if (result && typeof (result as PromiseLike<unknown>).then === "function") {
      void Promise.resolve(result).finally(release);
    } else {
      // Keep a synchronous action locked through the next paint. This closes
      // the double-tap window before a dialog or navigation becomes visible.
      requestAnimationFrame(release);
    }
  };

  return <ActionButton {...restProps} className={`outlaw-button ${fullWidth?'full-width':''} ${className}`} variant={variant==='primary'?'primary':variant==='danger'?'danger':'secondary'} onClick={handleClick} disabled={disabled} busy={busy} busyLabel={loadingLabel??'処理中…'}>{children}</ActionButton>;
}
