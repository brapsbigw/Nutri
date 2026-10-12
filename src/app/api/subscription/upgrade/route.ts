import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "NUTRITIONIST") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { planSlug } = await request.json();

    const targetPlan = await prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!targetPlan) {
      return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
    }

    const profile = await prisma.nutritionistProfile.findUnique({
      where: { userId: session.userId },
      include: { subscription: true },
    });

    if (!profile) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });

    // Update subscription
    const updated = await prisma.subscription.update({
      where: { nutritionistId: profile.id },
      data: {
        planId: targetPlan.id,
        status: "ACTIVE", // converted from trial to active
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "SUBSCRIPTION_PLAN_CHANGED",
        entityType: "Subscription",
        entityId: updated.id,
        metadata: JSON.stringify({ newPlan: targetPlan.slug }),
      },
    });

    return NextResponse.json({ success: true, subscription: updated });
  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json({ error: "Erro ao atualizar subscrição." }, { status: 500 });
  }
}
