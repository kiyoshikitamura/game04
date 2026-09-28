import { BillingError, sessionMatchesMode } from "./contracts";
import type { BillingMode, BillingOrder, CheckoutSession } from "./contracts";

type Event = { id: string; type: string; livemode: boolean; data?: { object?: { id?: unknown; metadata?: { application?: string } } } };
type Dependencies = {
  mode: BillingMode;
  session: (id: string) => Promise<CheckoutSession>;
  order: (id: string) => Promise<BillingOrder>;
  reconcile: (session: CheckoutSession, order: BillingOrder) => Promise<unknown>;
  record: (event: Event, order: BillingOrder, sessionId: string, state: "RECEIVED" | "COMPLETED" | "FAILED") => Promise<unknown>;
};
const TYPES = ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"];

/** Signature is verified by the route before this handler. No payload/customer data is persisted. */
export async function processStripeEvent(event: Event, deps: Dependencies) {
  if (event.livemode !== (deps.mode === "live")) throw new BillingError("Webhook mode mismatch", 400);
  if (!TYPES.includes(event.type)) return { received: true, ignored: true };
  if (!/^evt_[a-zA-Z0-9]+$/.test(event.id)) throw new BillingError("Invalid event", 400);
  const application = event.data?.object?.metadata?.application;
  if (application && application !== "game04") return { received: true, ignored: true };
  const id = event.data?.object?.id;
  if (!sessionMatchesMode(id, deps.mode)) throw new BillingError("Invalid session", 400);
  const session = await deps.session(id as string);
  if (session.metadata?.application && session.metadata.application !== "game04") return { received: true, ignored: true };
  // A shared Stripe account may deliver another application's session. Never create an order from it.
  if (!/^[0-9a-f-]{36}$/i.test(session.client_reference_id ?? "")) return { received: true, ignored: true };
  let order: BillingOrder;
  try { order = await deps.order(session.client_reference_id); }
  catch (error) {
    if (error instanceof BillingError && error.status === 404) return { received: true, ignored: true };
    throw error;
  }
  await deps.record(event, order, session.id, "RECEIVED");
  try {
    // Always reconcile the current provider state. A recorded event is not proof of fulfillment.
    await deps.reconcile(session, order);
    await deps.record(event, order, session.id, "COMPLETED");
  } catch (error) {
    // Preserve the original failure so Stripe retries. Never log exception text or event payload.
    try { await deps.record(event, order, session.id, "FAILED"); } catch { /* retry will restore the record */ }
    throw error;
  }
  return { received: true };
}
