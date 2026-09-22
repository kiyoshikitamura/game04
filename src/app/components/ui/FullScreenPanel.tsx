import React from "react";
import "./FullScreenPanel.css";
import OutlawButton from "./OutlawButton";
import CanonicalDialog from "./CanonicalDialog";
import { useGame } from "../../context/GameContext";

interface FullScreenPanelProps {
  children: React.ReactNode;
  title?: string;
  onClose: () => void;
  className?: string;
  showCloseButton?: boolean;
  closeDisabled?: boolean;
}

export default function FullScreenPanel({
  children,
  title,
  onClose,
  className = "",
  showCloseButton = true,
  closeDisabled = false,
}: FullScreenPanelProps) {
  const { playCyberSe } = useGame();

  const handleClose = () => {
    playCyberSe("click");
    onClose();
  };

  return <CanonicalDialog title={title} size="large" onClose={showCloseButton && !closeDisabled ? handleClose : undefined}>
    <div className={className}>{children}</div>
  </CanonicalDialog>;
}
