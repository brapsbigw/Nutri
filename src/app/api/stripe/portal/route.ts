import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createPortalSession, stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const profile = await prisma.nutritionistProfile.findUnique({
      where: { userId: session.userId },
      include: { subscription: true },
    });

    if (!profile || !profile.subscription?.paymentSubscriptionId) {
      return NextResponse.json(
        { error: 'Subscrição não encontrada.' },
        { status: 404 }
      );
    }

    // Obter o customer ID da subscrição Stripe
    const subscription = await stripe.subscriptions.retrieve(
      profile.subscription.paymentSubscriptionId
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const portalSession = await createPortalSession(
      subscription.customer as string,
      `${baseUrl}/settings`
    );

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão do portal.' },
      { status: 500 }
    );
  }
}
