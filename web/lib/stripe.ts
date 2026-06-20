// Stripe client — null when not configured (so the app runs without billing keys).
import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

export const PRICE_ID = process.env.STRIPE_PRICE_ID;
