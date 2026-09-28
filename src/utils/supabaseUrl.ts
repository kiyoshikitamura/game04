// G3 acceptance candidate is isolated from the shared development and Production projects.
export const GAME04_DEV_PROJECT_REF = "znakrkaazliexzwihxge";
export const GAME04_DEV_SUPABASE_ORIGIN = `https://${GAME04_DEV_PROJECT_REF}.supabase.co`;
const STANDARD_SUPABASE_ORIGIN_PATTERN = /^https:\/\/([a-z0-9-]+)\.supabase\.co\/?$/i;

export function getSupabaseProjectRef(value: string): string | null {
  return STANDARD_SUPABASE_ORIGIN_PATTERN.exec(value.trim())?.[1]?.toLowerCase() ?? null;
}

export function isValidSupabaseUrl(value: string, appEnvironment: string): boolean {
  if (!["development", "preview"].includes(appEnvironment.trim().toLowerCase())) return false;
  return getSupabaseProjectRef(value) === GAME04_DEV_PROJECT_REF;
}
