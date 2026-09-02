import { randomUUID } from "node:crypto";

const [featureKey = "application", state, messageCode = ""] = process.argv.slice(2);
const target = process.env.TARGET_ENVIRONMENT;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const expectedRef = process.env.SUPABASE_PROJECT_REF;

function stop(message) {
  console.error(`operations: ${message}`);
  process.exit(1);
}

if (target !== "dev-clean") stop("TARGET_ENVIRONMENT must be dev-clean.");
if (!url || !serviceKey || !expectedRef) stop("Supabase URL, project ref, and service role key are required.");
if (!/^[a-z][a-z0-9_.-]{0,63}$/.test(featureKey)) stop("feature key is invalid.");
if (!["enabled", "maintenance", "disabled"].includes(state)) stop("state must be enabled, maintenance, or disabled.");
if (messageCode && !/^[a-z][a-z0-9_.-]{0,63}$/.test(messageCode)) stop("message code is invalid.");

let endpoint;
try {
  endpoint = new URL("/rest/v1/rpc/set_operational_feature_state", url);
} catch {
  stop("Supabase URL is invalid.");
}
if (!endpoint.hostname.startsWith(`${expectedRef}.`)) stop("Supabase URL does not match SUPABASE_PROJECT_REF.");

const requestId = randomUUID();
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    p_request_id: requestId,
    p_feature_key: featureKey,
    p_state: state,
    p_message_code: messageCode || null,
  }),
});

if (!response.ok) stop(`state change failed with HTTP ${response.status}.`);
const result = await response.json();
console.log(JSON.stringify({
  requestId,
  auditId: result.audit_id,
  featureKey: result.feature_key,
  state: result.state,
  messageCode: result.message_code,
}));
