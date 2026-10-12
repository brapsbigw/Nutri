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

    const { title, description, type, targetValue, unit, frequency } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "O título do objetivo é obrigatório." }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        clientId,
        nutritionistId: profile.id,
        title: title.trim(),
        description: description?.trim() || null,
        type: type || "QUANTITATIVE",
        targetValue: targetValue ? parseFloat(targetValue) : null,
        unit: unit?.trim() || null,
        frequency: frequency?.trim() || "Diária",
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json({ error: "Erro ao criar objetivo." }, { status: 500 });
  }
}
