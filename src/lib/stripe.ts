import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder");

export const PLATFORM_FEE_BPS = Number(process.env.PLATFORM_FEE_BPS ?? "1500");

export function platformFeeAmount(priceCents: number): number {
  return Math.floor((priceCents * PLATFORM_FEE_BPS) / 10000);
}

export async function getOrCreateStripeCustomer(
  email: string,
  name: string,
  existingId?: string | null,
): Promise<string> {
  if (existingId) return existingId;
  const customer = await stripe.customers.create({ email, name });
  return customer.id;
}
