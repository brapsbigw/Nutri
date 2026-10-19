import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createCheckoutSession, STRIPE_PRICE_IDS, stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { planSlug } = await request.json();

    // Mapear slug do plano para o price ID do Stripe
    const priceMap: Record<string, string> = {
      starter: STRIPE_PRICE_IDS.STARTER || '',
      pro: STRIPE_PRICE_IDS.PRO || '',
      business: STRIPE_PRICE_IDS.BUSINESS || '',
    };

    const priceId = priceMap[planSlug];
    if (!priceId) {
      return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 });
    }

    const profile = await prisma.nutritionistProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
    }

    // Criar customer no Stripe se ainda não existir
    let stripeCustomerId = profile.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.email,
        name: profile.name,
        metadata: {
          nutritionistId: profile.id,
        },
      });
      stripeCustomerId = customer.id;

      // Guardar o customer ID no perfil
      await prisma.nutritionistProfile.update({
        where: { id: profile.id },
        data: { stripeCustomerId },
      });
    }

    // Criar sessão de checkout
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const checkoutSession = await createCheckoutSession(
      profile.id,
      priceId,
      `${baseUrl}/settings?subscription=success`,
      `${baseUrl}/settings?subscription=canceled`
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão de checkout.' },
      { status: 500 }
    );
  }
}
