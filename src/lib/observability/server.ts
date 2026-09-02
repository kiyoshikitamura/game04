import "server-only";

import { appEnvironment } from "@/lib/environment";
import type { TechnicalSignal } from "./contract.ts";

export function writeTechnicalSignal(signal: TechnicalSignal) {
  const record = {
    type: "game04.technical_signal",
    environment: appEnvironment(),
    ...signal,
  };
  const serialized = JSON.stringify(record);

  if (signal.severity === "error") console.error(serialized);
  else if (signal.severity === "warn") console.warn(serialized);
  else console.info(serialized);
}
