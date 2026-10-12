import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "NUTRITIONIST") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id: consultationId } = await params;
    const { status, observations, notes } = await request.json();

    const profile = await prisma.nutritionistProfile.findUnique({
      where: { userId: session.userId },
    });

    // Check ownership
    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        nutritionistId: profile?.id || "",
      },
    });

    if (!consultation) {
      return NextResponse.json({ error: "Consulta não encontrada ou acesso negado." }, { status: 404 });
    }

    const updated = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        ...(status ? { status } : {}),
        ...(observations !== undefined ? { observations } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json({ success: true, consultation: updated });
  } catch (error) {
    console.error("Update consultation error:", error);
    return NextResponse.json({ error: "Erro ao atualizar consulta." }, { status: 500 });
  }
}
