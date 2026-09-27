import { GAME04_DEV_PROJECT_REF, GAME04_PRODUCTION_PROJECT_REF, isValidSupabaseUrl } from "../../utils/supabaseUrl";
import { createHmac, timingSafeEqual } from "node:crypto";

export type BillingMode = "sandbox" | "live";
export const PRODUCTION_PROJECT_REF = GAME04_PRODUCTION_PROJECT_REF;
export const PREVIEW_PROJECT_REF = GAME04_DEV_PROJECT_REF;
const GAME04_PRODUCTION_ORIGIN = "https://sengoku-hime-ennbu.com";
export class BillingError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 400, code = "BILLING_ERROR") { super(message); this.status = status; this.code = code; }
}

export function assertPurchaseOperatingStates(rows: { feature_key: string; state: string; mutation_allowed: boolean }[] | null, feature: "PAYMENT" | "SHOP", maintenanceTester = false) {
  const maintenance = rows?.find(row => row.feature_key === "MAINTENANCE");
  const target = rows?.find(row => row.feature_key === feature);
  if (maintenance?.state === "MAINTENANCE" && !maintenanceTester) throw new BillingError("現在メンテナンス中です。", 503);
  if (!(maintenance?.state === "CLOSED" || (maintenance?.state === "MAINTENANCE" && maintenanceTester)) || target?.state !== "OPEN" || target.mutation_allowed !== true)
    throw new BillingError("現在、購入を受け付けていません。", 503);
}
export type CheckoutSession = {
  id: string; url?: string | null; livemode: boolean; status: string;
  payment_status: string; amount_total: number; currency: string;
  client_reference_id: string; metadata: Record<string, string>;
};
export type BillingOrder = {
  id: string; user_id: string; product_id: string; amount_jpy: number;
  billing_mode?: BillingMode;
  status: string; stripe_session_id: string | null; created_at: string;
  product_snapshot: { title: string; items: { itemId: string; quantity: number }[] };
};

/** 診断用の真偽値のみ。値・URL・例外本文を返さない。 */
export function sandboxEnvironmentChecks(env: NodeJS.ProcessEnv = process.env, requestOrigin?: string) {
  let returnOriginValid = false;
  let returnOriginMatchesRequest: boolean | null = null;
  try {
    const origin = new URL(env.BILLING_RETURN_ORIGIN ?? "");
    returnOriginValid = origin.protocol === "https:" && !origin.username && !origin.password &&
      origin.pathname === "/" && !origin.search && !origin.hash &&
      !["tribe-neon.com", "www.tribe-neon.com", "api.tribe-neon.com", "sengoku-hime-ennbu.com", "www.sengoku-hime-ennbu.com"].includes(origin.hostname);
    if (requestOrigin) returnOriginMatchesRequest = origin.origin === requestOrigin;
  } catch { /* missing or malformed origin */ }
  return {
    mode_sandbox: (env.BILLING_MODE ?? "sandbox") === "sandbox",
    sandbox_enabled: env.BILLING_SANDBOX_ENABLED === "true",
    non_production_runtime: env.VERCEL_ENV !== "production",
    preview_database: ["development", "preview"].includes((env.NEXT_PUBLIC_APP_ENV ?? "development").trim().toLowerCase()) &&
      isValidSupabaseUrl(env.NEXT_PUBLIC_SUPABASE_URL ?? "", env.NEXT_PUBLIC_APP_ENV ?? "development"),
    stripe_test_key_present: /^(?:sk|rk)_test_.+/.test(env.STRIPE_SECRET_KEY ?? ""),
    webhook_signing_secret_present: !!env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_"),
    service_role_present: !!env.SUPABASE_SERVICE_ROLE_KEY,
    return_origin_valid: returnOriginValid,
    return_origin_matches_request: returnOriginMatchesRequest,
  };
}

export type BillingReadinessCode = "ENVIRONMENT_INVALID" | "CATALOG_QUERY_FAILED" | "CATALOG_MISMATCH" | "READY" | "SERVICE_FAILED";
export function previewBillingDiagnostics(code: BillingReadinessCode, requestOrigin?: string, env: NodeJS.ProcessEnv = process.env) {
  return env.VERCEL_ENV === "preview"
    ? { diagnostics: { code, commitSha: /^[a-f0-9]{40}$/i.test(env.VERCEL_GIT_COMMIT_SHA ?? "") ? env.VERCEL_GIT_COMMIT_SHA : null,
      deploymentUrl: /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.vercel\.app$/i.test(env.VERCEL_URL ?? "") ? `https://${env.VERCEL_URL}` : null,
      raidRoomUiEnabled: process.env.NEXT_PUBLIC_RAID_ROOM_UI_ENABLED === "true",
      checks: sandboxEnvironmentChecks(env, requestOrigin) } }
    : {};
}

/** GAME03の明示的なtest/live分離を継承。GAME04専用DB・本番originだけを許可。 */
export function billingConfig(env: NodeJS.ProcessEnv = process.env) {
  const mode = env.BILLING_MODE ?? "sandbox";
  if (mode !== "sandbox" && mode !== "live") throw new BillingError("決済の準備中です。", 503);
  const live = mode === "live";
  const appEnvironment = (env.NEXT_PUBLIC_APP_ENV ?? "development").trim().toLowerCase();
  const databaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const validDatabase = isValidSupabaseUrl(databaseUrl, appEnvironment) &&
    (live ? appEnvironment === "production" : ["development", "preview"].includes(appEnvironment));
  const enabled = live
    ? env.BILLING_LIVE_ENABLED === "true" && env.VERCEL_ENV === "production"
    : env.BILLING_SANDBOX_ENABLED === "true" && env.VERCEL_ENV !== "production";
  if (!enabled || !validDatabase ||
      !(live ? /^(?:sk|rk)_live_.+/ : /^(?:sk|rk)_test_.+/).test(env.STRIPE_SECRET_KEY ?? "") ||
      !env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_") || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new BillingError("決済の準備中です。", 503);
  }
  let origin: URL;
  try { origin = new URL(env.BILLING_RETURN_ORIGIN ?? ""); }
  catch { throw new BillingError("決済の戻り先が未設定です。", 503); }
  const legacyOrigin = ["tribe-neon.com", "www.tribe-neon.com", "api.tribe-neon.com"].includes(origin.hostname);
  const productionOrigin = origin.origin === GAME04_PRODUCTION_ORIGIN;
  const productionHostname = ["sengoku-hime-ennbu.com", "www.sengoku-hime-ennbu.com"].includes(origin.hostname);
  if (origin.protocol !== "https:" || origin.username || origin.password ||
      origin.pathname !== "/" || origin.search || origin.hash || legacyOrigin ||
      (live ? !productionOrigin : productionHostname)) {
    throw new BillingError("決済の戻り先が不正です。", 503);
  }
  return { databaseUrl, serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
    stripeKey: env.STRIPE_SECRET_KEY, webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    origin: origin.origin, mode: mode as BillingMode };
}

export function sessionMatchesMode(id: unknown, mode: BillingMode) {
  return typeof id === "string" && (mode === "live" ? /^cs_live_[a-zA-Z0-9]+$/ : /^cs_test_[a-zA-Z0-9]+$/).test(id);
}

/** 別hostnameへ戻すと購入元のブラウザセッションを引き継げないため、予約前に拒否する。 */
export function validateCheckoutOrigin(request: Request, returnOrigin: string) {
  const requestOrigin = new URL(request.url).origin;
  const browserOrigin = request.headers.get("origin");
  if (requestOrigin !== returnOrigin || (browserOrigin !== null && browserOrigin !== returnOrigin)) {
    throw new BillingError(`購入用URL（${returnOrigin}）でログインし、ショップを開いてください。`, 409);
  }
}

export function uuid(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))
    throw new BillingError("購入番号が不正です。");
  return value;
}

/** JSON解析前の未加工UTF-8本文で署名を検証する。 */
export function verifyStripeEvent(raw: string, signature: string, secret: string, now = Date.now()) {
  const fields = signature.split(",").map(value => value.split("="));
  const time = fields.find(([key]) => key === "t")?.[1];
  if (!time || !/^\d+$/.test(time) || Math.abs(now / 1000 - Number(time)) > 300)
    throw new BillingError("Invalid webhook signature", 400);
  const expected = createHmac("sha256", secret).update(`${time}.${raw}`).digest();
  const valid = fields.some(([key, value]) => key === "v1" && /^[a-f0-9]{64}$/i.test(value ?? "") &&
    timingSafeEqual(expected, Buffer.from(value, "hex")));
  if (!valid) throw new BillingError("Invalid webhook signature", 400);
  try { return JSON.parse(raw); }
  catch { throw new BillingError("Invalid webhook payload", 400); }
}

export function validateSession(session: CheckoutSession, order: BillingOrder, mode: BillingMode = "sandbox") {
  if (session.livemode !== (mode === "live") || !sessionMatchesMode(session.id, mode) ||
      (order.billing_mode ?? "sandbox") !== mode ||
      session.client_reference_id !== order.id || session.metadata?.order_id !== order.id ||
      session.metadata?.user_id !== order.user_id || session.metadata?.product_id !== order.product_id ||
      session.amount_total !== order.amount_jpy || session.currency !== "jpy" ||
      (order.stripe_session_id && order.stripe_session_id !== session.id))
    throw new BillingError("決済情報と注文内容が一致しません。", 409);
  return session.status === "complete" && session.payment_status === "paid";
}
