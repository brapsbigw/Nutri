import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature') as string;

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET não configurado' },
      { status: 500 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const nutritionistId = session.metadata.nutritionistId;

        // Atualizar subscrição com ID do Stripe
        await prisma.subscription.update({
          where: { nutritionistId },
          data: {
            paymentProvider: 'stripe',
            paymentSubscriptionId: session.subscription,
            status: 'ACTIVE',
            currentPeriodStart: new Date(session.subscription_start_date * 1000),
            currentPeriodEnd: new Date(session.subscription_end_date * 1000),
          },
        });

        console.log(`Subscrição ativada para nutricionista ${nutritionistId}`);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;

        // Atualizar período da subscrição
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const nutritionistId = subscription.metadata.nutritionistId;

        await prisma.subscription.updateMany({
          where: { paymentSubscriptionId: subscriptionId },
          data: {
            status: 'ACTIVE',
            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          },
        });

        console.log(`Pagamento recebido para subscrição ${subscriptionId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;

        await prisma.subscription.updateMany({
          where: { paymentSubscriptionId: subscriptionId },
          data: { status: 'PAST_DUE' },
        });

        console.log(`Pagamento falhou para subscrição ${subscriptionId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const nutritionistId = subscription.metadata.nutritionistId;

        await prisma.subscription.updateMany({
          where: { paymentSubscriptionId: subscription.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
        });

        console.log(`Subscrição cancelada para nutricionista ${nutritionistId}`);
        break;
      }

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}
