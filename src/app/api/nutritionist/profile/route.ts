import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "NUTRITIONIST") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { name, bio, phone, licenseNumber, specializations } = await request.json();

    const profile = await prisma.nutritionistProfile.update({
      where: { userId: session.userId },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(bio !== undefined ? { bio: bio?.trim() || null } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
        ...(licenseNumber !== undefined ? { licenseNumber: licenseNumber?.trim() || null } : {}),
        ...(specializations !== undefined ? { specializations: specializations?.trim() || null } : {}),
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Erro ao atualizar perfil." }, { status: 500 });
  }
}
