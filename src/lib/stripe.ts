import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    stripeInstance = new Stripe(secretKey, {
      typescript: true,
    });
  }
  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    const instance = getStripe();
    return (instance as any)[prop];
  },
});

// Planos de preços no Stripe (devem ser criados no dashboard)
export const STRIPE_PRICE_IDS = {
  STARTER: process.env.STRIPE_PRICE_STARTER,
  PRO: process.env.STRIPE_PRICE_PRO,
  BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
} as const;

export async function createCheckoutSession(
  nutritionistId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_collection: 'always',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      nutritionistId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    customer_creation: 'always',
    subscription_data: {
      trial_period_days: 14, // 14 dias de teste grátis
    },
  });

  return session;
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function getSubscription(subscriptionId: string) {
  const stripe = getStripe();

  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripe();

  return await stripe.subscriptions.cancel(subscriptionId);
}

