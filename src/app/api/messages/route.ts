import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { content, conversationId, clientId } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "A mensagem não pode estar vazia." },
        { status: 400 }
      );
    }

    let targetConvId = conversationId;

    // If conversationId is not provided, look up or create conversation
    if (!targetConvId) {
      if (session.role === "CLIENT") {
        const clientProfile = await prisma.clientProfile.findUnique({
          where: { userId: session.userId },
        });
        if (!clientProfile) {
          return NextResponse.json({ error: "Perfil de cliente não encontrado." }, { status: 404 });
        }

        let conv = await prisma.conversation.findUnique({
          where: {
            nutritionistId_clientId: {
              nutritionistId: clientProfile.nutritionistId,
              clientId: clientProfile.id,
            },
          },
        });

        if (!conv) {
          conv = await prisma.conversation.create({
            data: {
              nutritionistId: clientProfile.nutritionistId,
              clientId: clientProfile.id,
            },
          });
        }
        targetConvId = conv.id;
      } else if (session.role === "NUTRITIONIST") {
        const profile = await prisma.nutritionistProfile.findUnique({
          where: { userId: session.userId },
        });
        if (!profile || !clientId) {
          return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
        }

        let conv = await prisma.conversation.findUnique({
          where: {
            nutritionistId_clientId: {
              nutritionistId: profile.id,
              clientId,
            },
          },
        });

        if (!conv) {
          conv = await prisma.conversation.create({
            data: {
              nutritionistId: profile.id,
              clientId,
            },
          });
        }
        targetConvId = conv.id;
      }
    }

    // Verify conversation access
    const conversation = await prisma.conversation.findUnique({
      where: { id: targetConvId },
      include: {
        nutritionist: true,
        client: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
    }

    // Tenant check: User must be either the client or the nutritionist of this conversation
    if (session.role === "NUTRITIONIST") {
      if (conversation.nutritionist.userId !== session.userId) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
    } else if (session.role === "CLIENT") {
      if (conversation.client.userId !== session.userId) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: targetConvId,
        senderId: session.userId,
        content: content.trim(),
        messageType: "TEXT",
        isRead: false,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: targetConvId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json({ error: "Erro ao enviar mensagem." }, { status: 500 });
  }
}
