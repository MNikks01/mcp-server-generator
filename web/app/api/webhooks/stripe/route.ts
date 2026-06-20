import { getStripe } from "@/lib/stripe";
import { getStore } from "@/lib/db/store";

export const runtime = "nodejs";

// Stripe webhook — flips a user to Pro on successful checkout, back to Free on cancel.
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("billing not configured", { status: 501 });

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", secret);
  } catch {
    return new Response("invalid signature", { status: 400 });
  }

  const store = getStore();
  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    if (s.client_reference_id) {
      await store.setPlan(s.client_reference_id, "pro");
      if (s.customer) await store.linkStripeCustomer(s.client_reference_id, String(s.customer));
    }
  } else if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const u = await store.findByStripeCustomer(String(sub.customer));
    if (u) await store.setPlan(u.id, "free");
  }
  return new Response("ok");
}
