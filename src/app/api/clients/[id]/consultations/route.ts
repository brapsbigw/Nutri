import { NextResponse } from "next/server";
import { getSession, verifyNutritionistClientAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "NUTRITIONIST") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id: clientId } = await params;
    const hasAccess = await verifyNutritionistClientAccess(session.userId, clientId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const profile = await prisma.nutritionistProfile.findUnique({
      where: { userId: session.userId },
    });
    if (!profile) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });

    const { scheduledAt, durationMinutes, notes, observations, nextConsultationAt } =
      await request.json();

    if (!scheduledAt) {
      return NextResponse.json({ error: "Data e hora são obrigatórias." }, { status: 400 });
    }

    const consultation = await prisma.consultation.create({
      data: {
        clientId,
        nutritionistId: profile.id,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : 60,
        status: "SCHEDULED",
        notes: notes?.trim() || null,
        observations: observations?.trim() || null,
        nextConsultationAt: nextConsultationAt ? new Date(nextConsultationAt) : null,
      },
    });

    return NextResponse.json({ success: true, consultation });
  } catch (error) {
    console.error("Create consultation error:", error);
    return NextResponse.json({ error: "Erro ao agendar consulta." }, { status: 500 });
  }
}
