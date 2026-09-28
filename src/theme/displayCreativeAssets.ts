import { characterArt as originalArt, characterBackground as originalBackground } from './creativeAssets';
import { displayImage } from './displayImages';

// UI-only adapters. Server masters and saved battle snapshots retain original URLs.
export const characterArt = (...args: Parameters<typeof originalArt>) => displayImage(originalArt(...args));
export const characterBackground = (...args: Parameters<typeof originalBackground>) => displayImage(originalBackground(...args));
