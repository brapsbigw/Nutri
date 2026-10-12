import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CLIENT") {
      return NextResponse.json({ error: "Apenas clientes podem registar refeições." }, { status: 401 });
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!clientProfile) {
      return NextResponse.json({ error: "Perfil de cliente não encontrado." }, { status: 404 });
    }

    const { mealId, planDayId, logDate, status, note, actualItems } = await request.json();

    if (!mealId || !status) {
      return NextResponse.json(
        { error: "Refeição e estado são obrigatórios." },
        { status: 400 }
      );
    }

    const dateStr = logDate || new Date().toISOString().split("T")[0];

    // Upsert meal log for this day and meal
    const log = await prisma.mealLog.upsert({
      where: {
        mealId_clientId_logDate: {
          mealId,
          clientId: clientProfile.id,
          logDate: dateStr,
        },
      },
      update: {
        status,
        note: note?.trim() || null,
        actualItems: actualItems ? JSON.stringify(actualItems) : null,
        updatedAt: new Date(),
      },
      create: {
        mealId,
        clientId: clientProfile.id,
        planDayId: planDayId || "",
        logDate: dateStr,
        status,
        note: note?.trim() || null,
        actualItems: actualItems ? JSON.stringify(actualItems) : null,
      },
    });

    // Update client last activity timestamp
    await prisma.clientProfile.update({
      where: { id: clientProfile.id },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Meal log error:", error);
    return NextResponse.json({ error: "Erro ao registar refeição." }, { status: 500 });
  }
}
