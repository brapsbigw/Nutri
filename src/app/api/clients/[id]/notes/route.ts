import { NextResponse } from "next/server";
import { getSession, verifyNutritionistClientAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "NUTRITIONIST") {
      return NextResponse.json({ error: "Não autorizado. Apenas nutricionistas podem ler notas privadas." }, { status: 403 });
    }

    const { id: clientId } = await params;
    const hasAccess = await verifyNutritionistClientAccess(session.userId, clientId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const notes = await prisma.note.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao ler notas." }, { status: 500 });
  }
}

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

    // Tenant Isolation Check
    const hasAccess = await verifyNutritionistClientAccess(session.userId, clientId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Acesso negado. Este cliente não pertence à tua prática clínica." },
        { status: 403 }
      );
    }

    const { title, content, consultationId } = await request.json();
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "O conteúdo da nota é obrigatório." }, { status: 400 });
    }

    const profile = await prisma.nutritionistProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });

    const note = await prisma.note.create({
      data: {
        nutritionistId: profile.id,
        clientId,
        title: title?.trim() || null,
        content: content.trim(),
        isPrivate: true,
        consultationId: consultationId || null,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json({ error: "Erro ao guardar nota clínica." }, { status: 500 });
  }
}
