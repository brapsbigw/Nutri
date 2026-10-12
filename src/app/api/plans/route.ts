import { NextResponse } from "next/server";
import { getSession, verifyNutritionistClientAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "NUTRITIONIST" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const profile = await prisma.nutritionistProfile.findUnique({
      where: { userId: session.userId },
    });

    const plans = await prisma.nutritionPlan.findMany({
      where: {
        ...(session.role === "NUTRITIONIST" && profile ? { nutritionistId: profile.id } : {}),
      },
      include: {
        client: true,
        days: {
          include: {
            meals: {
              include: {
                items: { include: { food: true } },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Fetch plans error:", error);
    return NextResponse.json({ error: "Erro ao carregar planos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "NUTRITIONIST") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const profile = await prisma.nutritionistProfile.findUnique({
      where: { userId: session.userId },
    });
    if (!profile) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });

    const { clientId, title, description, status = "DRAFT", days = [] } = await request.json();

    if (!clientId || !title) {
      return NextResponse.json(
        { error: "Cliente e título do plano são obrigatórios." },
        { status: 400 }
      );
    }

    // Tenant check
    const hasAccess = await verifyNutritionistClientAccess(session.userId, clientId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Acesso negado a este cliente." }, { status: 403 });
    }

    // Create plan in transaction
    const plan = await prisma.$transaction(async (tx) => {
      // If publishing this plan, archive any previous published plan for this client
      if (status === "PUBLISHED") {
        await tx.nutritionPlan.updateMany({
          where: { clientId, status: "PUBLISHED" },
          data: { status: "ARCHIVED" },
        });
      }

      const newPlan = await tx.nutritionPlan.create({
        data: {
          nutritionistId: profile.id,
          clientId,
          title: title.trim(),
          description: description?.trim() || null,
          status,
          startsAt: status === "PUBLISHED" ? new Date() : null,
        },
      });

      // Create Days, Meals and Items
      for (let dIndex = 0; dIndex < days.length; dIndex++) {
        const d = days[dIndex];
        const newDay = await tx.planDay.create({
          data: {
            planId: newPlan.id,
            dayNumber: dIndex + 1,
            label: d.label || `Dia ${dIndex + 1}`,
            notes: d.notes || null,
          },
        });

        for (let mIndex = 0; mIndex < (d.meals || []).length; mIndex++) {
          const m = d.meals[mIndex];
          const newMeal = await tx.meal.create({
            data: {
              planDayId: newDay.id,
              name: m.name,
              scheduledTime: m.scheduledTime || null,
              orderIndex: mIndex + 1,
              instructions: m.instructions || null,
            },
          });

          for (let iIndex = 0; iIndex < (m.items || []).length; iIndex++) {
            const it = m.items[iIndex];
            await tx.mealItem.create({
              data: {
                mealId: newMeal.id,
                foodId: it.foodId || null,
                quantity: parseFloat(it.quantity) || 100,
                unit: it.unit || "g",
                orderIndex: iIndex + 1,
              },
            });
          }
        }
      }

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "PLAN_CREATED",
          entityType: "NutritionPlan",
          entityId: newPlan.id,
          metadata: JSON.stringify({ clientId, title, status }),
        },
      });

      return newPlan;
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Create plan error:", error);
    return NextResponse.json({ error: "Erro ao criar plano alimentar." }, { status: 500 });
  }
}
