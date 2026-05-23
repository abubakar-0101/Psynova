import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

export async function createCheckoutSession({
  appointmentId,
  therapistName,
  sessionDate,
  amount,
  currency = 'usd',
  clientEmail,
  successUrl,
  cancelUrl,
}: {
  appointmentId: string;
  therapistName: string;
  sessionDate: string;
  amount: number;
  currency?: string;
  clientEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: clientEmail,
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `Therapy Session with ${therapistName}`,
            description: `Session on ${sessionDate}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId,
    },
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
  });

  return session;
}

export async function createRefund(paymentIntentId: string, amount?: number) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount && { amount: Math.round(amount * 100) }),
  });
  return refund;
}
