import React from "react";
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

  return (
    <CanonicalDialog
      title={title}
      density="compact"
      className={className}
      onClose={showCloseButton && !closeDisabled ? handleClose : undefined}
      actions={showCloseButton ? [{label:'閉じる',onClick:handleClose,disabled:closeDisabled}] : []}
    >
      <div inert={closeDisabled}>{children}</div>
    </CanonicalDialog>
  );
}
