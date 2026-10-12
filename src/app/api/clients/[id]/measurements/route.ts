import { NextResponse } from "next/server";
import { getSession, verifyNutritionistClientAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id: clientId } = await params;

    // Check permissions
    if (session.role === "NUTRITIONIST") {
      const hasAccess = await verifyNutritionistClientAccess(session.userId, clientId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
    } else if (session.role === "CLIENT") {
      const profile = await prisma.clientProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!profile || profile.id !== clientId) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
    }

    const { measurementTypeId, value, unit, measuredAt, consultationId, notes } =
      await request.json();

    if (!measurementTypeId || value === undefined || !unit) {
      return NextResponse.json(
        { error: "Tipo de medição, valor e unidade são obrigatórios." },
        { status: 400 }
      );
    }

    const recordedByRole = session.role === "NUTRITIONIST" ? "NUTRITIONIST" : "CLIENT";

    const measurement = await prisma.measurement.create({
      data: {
        clientId,
        measurementTypeId,
        value: parseFloat(value),
        unit,
        measuredAt: measuredAt ? new Date(measuredAt) : new Date(),
        recordedById: session.userId,
        recordedByRole,
        consultationId: consultationId || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, measurement });
  } catch (error) {
    console.error("Create measurement error:", error);
    return NextResponse.json(
      { error: "Erro ao registar medição." },
      { status: 500 }
    );
  }
}
