import { NextResponse } from "next/server";
import { getStripe, PRICE_ID } from "@/lib/stripe";
import { getUserId } from "@/lib/identity";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe || !PRICE_ID) {
    return NextResponse.json(
      { error: { code: "billing_not_configured", message: "Billing isn't configured (set STRIPE_SECRET_KEY + STRIPE_PRICE_ID)." } },
      { status: 501 },
    );
  }
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: { code: "no_session", message: "Load the app first to establish a session." } }, { status: 401 });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    client_reference_id: userId,
    success_url: `${origin}/?upgraded=1`,
    cancel_url: `${origin}/pricing`,
  });
  return NextResponse.json({ url: session.url });
}
