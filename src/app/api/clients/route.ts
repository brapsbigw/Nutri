import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "NUTRITIONIST" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const status = searchParams.get("status");

    const profile = await prisma.nutritionistProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile && session.role !== "ADMIN") {
      return NextResponse.json({ clients: [] });
    }

    const whereClause: Record<string, unknown> = {
      deletedAt: null,
    };

    if (session.role === "NUTRITIONIST" && profile) {
      whereClause.nutritionistId = profile.id;
    }

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const clients = await prisma.clientProfile.findMany({
      where: whereClause,
      include: {
        invite: true,
        plans: {
          where: { status: "PUBLISHED" },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
        consultations: {
          orderBy: { scheduledAt: "desc" },
          take: 1,
        },
        mealLogs: {
          take: 20,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const filtered = query
      ? clients.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            (c.email && c.email.toLowerCase().includes(query)) ||
            (c.phone && c.phone.includes(query))
        )
      : clients;

    return NextResponse.json({ clients: filtered });
  } catch (error) {
    console.error("Fetch clients error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar lista de clientes." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "NUTRITIONIST") {
      return NextResponse.json({ error: "Apenas nutricionistas podem criar clientes." }, { status: 401 });
    }

    const profile = await prisma.nutritionistProfile.findUnique({
      where: { userId: session.userId },
      include: {
        subscription: { include: { plan: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil de nutricionista não encontrado." }, { status: 404 });
    }

    // Check Plan Limits
    const currentActiveClients = await prisma.clientProfile.count({
      where: {
        nutritionistId: profile.id,
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    const maxClients = profile.subscription?.plan.maxClients || 25;
    if (currentActiveClients >= maxClients) {
      return NextResponse.json(
        {
          error: `Atingiste o limite máximo de ${maxClients} clientes ativos do teu plano ${profile.subscription?.plan.name || "atual"}. Faz upgrade da subscrição para adicionar mais clientes.`,
        },
        { status: 403 }
      );
    }

    const { name, email, phone, gender, dateOfBirth, notes } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "O nome do cliente é obrigatório." }, { status: 400 });
    }

    // Generate cryptographically unique invite code: e.g. INV-A9F2-K891
    const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
    const inviteCode = `INV-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}`;

    const client = await prisma.$transaction(async (tx) => {
      const newClient = await tx.clientProfile.create({
        data: {
          nutritionistId: profile.id,
          name: name.trim(),
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          gender: gender?.trim() || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          notes: notes?.trim() || null,
          status: "ACTIVE",
        },
      });

      const newInvite = await tx.invite.create({
        data: {
          code: inviteCode,
          nutritionistId: profile.id,
          clientId: newClient.id,
          clientEmail: email?.trim() || null,
          status: "PENDING",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "CLIENT_CREATED",
          entityType: "ClientProfile",
          entityId: newClient.id,
          metadata: JSON.stringify({ inviteCode }),
        },
      });

      return { ...newClient, invite: newInvite };
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json({ error: "Erro ao criar cliente." }, { status: 500 });
  }
}
