import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password, trialKey, phone, licenseNumber } =
      await request.json();

    if (!name || !email || !password || !trialKey) {
      return NextResponse.json(
        { error: "Nome, e-mail, palavra-passe e chave de trial são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A palavra-passe deve ter pelo menos 8 carateres." },
        { status: 400 }
      );
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe uma conta associada a este endereço de e-mail." },
        { status: 400 }
      );
    }

    // Verify Trial Key
    const key = await prisma.trialKey.findUnique({
      where: { code: trialKey.trim() },
    });

    if (!key) {
      return NextResponse.json(
        { error: "Chave de trial inválida ou não encontrada." },
        { status: 400 }
      );
    }

    if (key.status !== "UNUSED") {
      return NextResponse.json(
        { error: "Esta chave de trial já foi utilizada ou expirou." },
        { status: 400 }
      );
    }

    // Get Starter Plan for trial
    const starterPlan = await prisma.subscriptionPlan.findFirst({
      where: { slug: "starter" },
    });

    if (!starterPlan) {
      return NextResponse.json(
        { error: "Plano de subscrição base não configurado no sistema." },
        { status: 500 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + key.durationDays * 24 * 60 * 60 * 1000);

    // Create user and profile in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          role: "NUTRITIONIST",
          isActive: true,
          emailVerified: now,
        },
      });

      const profile = await tx.nutritionistProfile.create({
        data: {
          userId: user.id,
          name: name.trim(),
          phone: phone?.trim() || null,
          licenseNumber: licenseNumber?.trim() || null,
        },
      });

      await tx.trialKey.update({
        where: { id: key.id },
        data: {
          nutritionistId: user.id,
          status: "ACTIVE",
          activatedAt: now,
          expiresAt,
        },
      });

      await tx.subscription.create({
        data: {
          nutritionistId: profile.id,
          planId: starterPlan.id,
          status: "TRIAL",
          trialKeyId: key.id,
          currentPeriodStart: now,
          currentPeriodEnd: expiresAt,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "NUTRITIONIST_REGISTERED_WITH_TRIAL",
          entityType: "NutritionistProfile",
          entityId: profile.id,
          metadata: JSON.stringify({ trialKey: key.code, durationDays: key.durationDays }),
        },
      });

      return { user, profile };
    });

    // Create session
    await createSession({
      userId: newUser.user.id,
      email: newUser.user.email,
      role: "NUTRITIONIST",
      name: newUser.profile.name,
      nutritionistProfileId: newUser.profile.id,
    });

    return NextResponse.json({
      success: true,
      redirectTo: "/dashboard",
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        name: newUser.profile.name,
        role: "NUTRITIONIST",
      },
    });
  } catch (error) {
    console.error("Register nutritionist error:", error);
    return NextResponse.json(
      { error: "Erro ao criar conta de nutricionista." },
      { status: 500 }
    );
  }
}
