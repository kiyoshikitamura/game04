import { verifyStripeEvent } from "@/server/billing/contracts";
import { processStripeEvent } from "@/server/billing/webhook";
import { billingService, billingFailure, billingResponse } from "@/server/billing/service";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const billing = billingService();
    const raw = await request.text();
    const event = verifyStripeEvent(raw, request.headers.get("stripe-signature") ?? "", billing.config.webhookSecret);
    const result = await processStripeEvent(event, {
      mode: billing.config.mode,
      session: id => billing.stripe(`checkout/sessions/${encodeURIComponent(id)}`),
      order: billing.order, reconcile: billing.reconcile,
      record: (item, order, sessionId, state) => billing.rpc("game04_record_billing_event", {
        p_event_id: item.id, p_order_id: order.id, p_session_id: sessionId,
        p_event_type: item.type, p_state: state, p_mode: billing.config.mode,
      }),
    });
    return billingResponse(result);
  } catch (error) { return billingFailure(error); }
}
