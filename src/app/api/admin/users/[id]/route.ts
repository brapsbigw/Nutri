import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const { id: userId } = await params;
    const { isActive } = await request.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: isActive ? "ADMIN_USER_ACTIVATED" : "ADMIN_USER_DEACTIVATED",
        entityType: "User",
        entityId: userId,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Update user status error:", error);
    return NextResponse.json({ error: "Erro ao atualizar estado do utilizador." }, { status: 500 });
  }
}
