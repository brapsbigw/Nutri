import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Apenas administradores podem gerar chaves de trial." }, { status: 403 });
    }

    const { durationDays = 30, customCode } = await request.json();

    let code = customCode?.trim().toUpperCase();
    if (!code) {
      const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
      code = `TRIAL-${rand.slice(0, 3)}-${rand.slice(3, 6)}`;
    }

    const existing = await prisma.trialKey.findUnique({
      where: { code },
    });
    if (existing) {
      return NextResponse.json({ error: "Já existe uma chave com este código." }, { status: 400 });
    }

    const trialKey = await prisma.trialKey.create({
      data: {
        code,
        createdById: session.userId,
        durationDays: parseInt(durationDays) || 30,
        status: "UNUSED",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "ADMIN_TRIAL_KEY_CREATED",
        entityType: "TrialKey",
        entityId: trialKey.id,
        metadata: JSON.stringify({ code: trialKey.code, durationDays }),
      },
    });

    return NextResponse.json({ success: true, trialKey });
  } catch (error) {
    console.error("Create trial key error:", error);
    return NextResponse.json({ error: "Erro ao gerar chave de trial." }, { status: 500 });
  }
}
