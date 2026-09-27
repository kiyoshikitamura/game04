// G3 acceptance candidate is isolated from the shared development and Production projects.
export const GAME04_DEV_PROJECT_REF = "znakrkaazliexzwihxge";
export const GAME04_PRODUCTION_PROJECT_REF = "soiksqgtmcnspfedmanr";
export const GAME04_DEV_SUPABASE_ORIGIN = `https://${GAME04_DEV_PROJECT_REF}.supabase.co`;
const STANDARD_SUPABASE_ORIGIN_PATTERN = /^https:\/\/([a-z0-9-]+)\.supabase\.co\/?$/i;

export function getSupabaseProjectRef(value: string): string | null {
  return STANDARD_SUPABASE_ORIGIN_PATTERN.exec(value.trim())?.[1]?.toLowerCase() ?? null;
}

export function isValidSupabaseUrl(value: string, appEnvironment: string): boolean {
  const environment = appEnvironment.trim().toLowerCase();
  if (environment === "production") return getSupabaseProjectRef(value) === GAME04_PRODUCTION_PROJECT_REF;
  return ["development", "preview"].includes(environment) && getSupabaseProjectRef(value) === GAME04_DEV_PROJECT_REF;
}
