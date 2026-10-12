import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password, inviteCode, phone } = await request.json();

    if (!email || !password || !inviteCode) {
      return NextResponse.json(
        { error: "E-mail, palavra-passe e código de convite são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A palavra-passe deve ter pelo menos 8 carateres." },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe uma conta associada a este endereço de e-mail." },
        { status: 400 }
      );
    }

    // Find and validate invite
    const invite = await prisma.invite.findUnique({
      where: { code: inviteCode.trim() },
      include: {
        nutritionist: true,
        client: true,
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Código de convite inválido ou não encontrado." },
        { status: 400 }
      );
    }

    if (invite.status !== "PENDING") {
      return NextResponse.json(
        {
          error:
            invite.status === "ACCEPTED"
              ? "Este convite já foi utilizado para ativar uma conta."
              : "Este convite encontra-se expirado ou foi revogado.",
        },
        { status: 400 }
      );
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "Este código de convite expirou. Solicita um novo ao teu nutricionista." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          role: "CLIENT",
          isActive: true,
          emailVerified: now,
        },
      });

      let clientProfile;
      if (invite.clientId && invite.client) {
        // Link to existing pre-created client record
        clientProfile = await tx.clientProfile.update({
          where: { id: invite.clientId },
          data: {
            userId: user.id,
            email: user.email,
            name: name?.trim() || invite.client.name,
            phone: phone?.trim() || invite.client.phone,
            lastActivityAt: now,
          },
        });
      } else {
        // Create new client record linked to nutritionist
        clientProfile = await tx.clientProfile.create({
          data: {
            userId: user.id,
            nutritionistId: invite.nutritionistId,
            name: name?.trim() || "Cliente",
            email: user.email,
            phone: phone?.trim() || null,
            status: "ACTIVE",
            joinedAt: now,
            lastActivityAt: now,
          },
        });
      }

      // Mark invite as ACCEPTED
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: now,
          clientId: clientProfile.id,
        },
      });

      // Automatically create a private conversation between client and nutritionist
      const existingConv = await tx.conversation.findUnique({
        where: {
          nutritionistId_clientId: {
            nutritionistId: invite.nutritionistId,
            clientId: clientProfile.id,
          },
        },
      });

      if (!existingConv) {
        await tx.conversation.create({
          data: {
            nutritionistId: invite.nutritionistId,
            clientId: clientProfile.id,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CLIENT_ACCOUNT_LINKED_VIA_INVITE",
          entityType: "ClientProfile",
          entityId: clientProfile.id,
          metadata: JSON.stringify({
            inviteCode: invite.code,
            nutritionistId: invite.nutritionistId,
          }),
        },
      });

      return { user, clientProfile };
    });

    // Create session
    await createSession({
      userId: result.user.id,
      email: result.user.email,
      role: "CLIENT",
      name: result.clientProfile.name,
      clientProfileId: result.clientProfile.id,
    });

    return NextResponse.json({
      success: true,
      redirectTo: "/client",
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.clientProfile.name,
        role: "CLIENT",
      },
    });
  } catch (error) {
    console.error("Register client error:", error);
    return NextResponse.json(
      { error: "Erro ao ativar conta de cliente." },
      { status: 500 }
    );
  }
}
