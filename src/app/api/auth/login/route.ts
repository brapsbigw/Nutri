import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Por favor introduz o e-mail e a palavra-passe." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        nutritionistProfile: true,
        clientProfile: true,
      },
    });

    if (!user || !user.passwordHash || !user.isActive) {
      return NextResponse.json(
        { error: "E-mail ou palavra-passe incorretos." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "E-mail ou palavra-passe incorretos." },
        { status: 401 }
      );
    }

    // Determine profile and names
    let name = user.email.split("@")[0];
    let nutritionistProfileId: string | null = null;
    let clientProfileId: string | null = null;
    let clinicId: string | null = null;

    if (user.role === "NUTRITIONIST" && user.nutritionistProfile) {
      name = user.nutritionistProfile.name;
      nutritionistProfileId = user.nutritionistProfile.id;
      clinicId = user.nutritionistProfile.clinicId;
    } else if (user.role === "CLIENT" && user.clientProfile) {
      name = user.clientProfile.name;
      clientProfileId = user.clientProfile.id;
    } else if (user.role === "ADMIN") {
      name = "Administrador";
    }

    // Set JWT Session Cookie
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "NUTRITIONIST" | "CLIENT",
      name,
      nutritionistProfileId,
      clientProfileId,
      clinicId,
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        entityType: "User",
        entityId: user.id,
      },
    });

    // Determine redirect
    let redirectTo = "/dashboard";
    if (user.role === "CLIENT") redirectTo = "/client";
    if (user.role === "ADMIN") redirectTo = "/admin";

    return NextResponse.json({
      success: true,
      role: user.role,
      redirectTo,
      user: {
        id: user.id,
        email: user.email,
        name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar autenticação." },
      { status: 500 }
    );
  }
}
