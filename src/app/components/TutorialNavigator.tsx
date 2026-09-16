"use client";

import type { ReactNode } from "react";
import CharacterPresentation from "./character/CharacterPresentation";

export default function TutorialNavigator({ message }: { message: ReactNode }) {
  return (
    <div className="tutorial-navigator">
      <div className="tutorial-navigator-portrait">
        <CharacterPresentation
          src="/characters/ageha_transparent_asset.png"
          alt="豊臣秀吉"
          variant="dialogue-bust"
          className="tutorial-navigator-character"
        />
      </div>
      <div className="tutorial-navigator-copy text-left">
        <div className="tutorial-navigator-name font-size-8 text-color-cyan font-weight-bold">豊臣秀吉</div>
        <div className="tutorial-navigator-message text-white">{message}</div>
      </div>
    </div>
  );
}
