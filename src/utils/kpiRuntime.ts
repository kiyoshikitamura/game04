import { GAME04_DEV_PROJECT_REF, GAME04_DEV_SUPABASE_ORIGIN, isValidSupabaseUrl } from "./supabaseUrl";

// 旧exportは上流互換のため維持。GAME04 Productionは未設定。
export const KPI_PRODUCTION_PROJECT_REF = "";
export const KPI_PRODUCTION_STANDARD_ORIGIN = "";
export const KPI_PREVIEW_PROJECT_REF = GAME04_DEV_PROJECT_REF;
export const KPI_PREVIEW_STANDARD_ORIGIN = GAME04_DEV_SUPABASE_ORIGIN;

type KpiRuntimeConfig = { appEnvironment?: string; dataEnvironment?: string; supabaseUrl?: string };
export type KpiRuntimeValidation =
  | { enabled: false; reason: "app_environment" | "data_environment" | "missing_supabase_url" | "project_mismatch" }
  | { enabled: true; origin: string };

// 名称は上流互換。GAME04ではdev/previewデータだけ許可する。
export function validateProductionKpiRuntime(config: KpiRuntimeConfig): KpiRuntimeValidation {
  const app = config.appEnvironment?.trim().toLowerCase() ?? "";
  if (!["development", "preview"].includes(app)) return { enabled: false, reason: "app_environment" };
  if (!["development", "preview"].includes(config.dataEnvironment?.trim().toLowerCase() ?? "")) {
    return { enabled: false, reason: "data_environment" };
  }
  if (!config.supabaseUrl?.trim()) return { enabled: false, reason: "missing_supabase_url" };
  if (!isValidSupabaseUrl(config.supabaseUrl, app)) return { enabled: false, reason: "project_mismatch" };
  return { enabled: true, origin: GAME04_DEV_SUPABASE_ORIGIN };
}

export function validateKpiV2Runtime(config: KpiRuntimeConfig) {
  const result = validateProductionKpiRuntime(config);
  return result.enabled ? { ...result, dataEnvironment: config.dataEnvironment?.trim().toLowerCase() } : result;
}
