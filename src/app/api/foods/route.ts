import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const category = searchParams.get("category");

    let nutritionistId: string | null = null;
    if (session.role === "NUTRITIONIST") {
      const profile = await prisma.nutritionistProfile.findUnique({
        where: { userId: session.userId },
      });
      nutritionistId = profile?.id || null;
    }

    // Return global foods OR custom foods created by this nutritionist
    const foods = await prisma.food.findMany({
      where: {
        isActive: true,
        OR: [
          { source: "GLOBAL" },
          ...(nutritionistId ? [{ source: "CUSTOM", nutritionistId }] : []),
        ],
        ...(category && category !== "ALL" ? { category } : {}),
      },
      orderBy: { name: "asc" },
    });

    const filtered = query
      ? foods.filter(
          (f) =>
            f.name.toLowerCase().includes(query) ||
            (f.category && f.category.toLowerCase().includes(query))
        )
      : foods;

    return NextResponse.json({ foods: filtered });
  } catch (error) {
    console.error("Fetch foods error:", error);
    return NextResponse.json({ error: "Erro ao carregar alimentos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "NUTRITIONIST") {
      return NextResponse.json({ error: "Apenas nutricionistas podem criar alimentos personalizados." }, { status: 401 });
    }

    const profile = await prisma.nutritionistProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
    }

    const { name, category, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fiberPer100g } =
      await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "O nome do alimento é obrigatório." }, { status: 400 });
    }

    const food = await prisma.food.create({
      data: {
        name: name.trim(),
        category: category?.trim() || "Geral",
        caloriesPer100g: caloriesPer100g ? parseFloat(caloriesPer100g) : null,
        proteinPer100g: proteinPer100g ? parseFloat(proteinPer100g) : null,
        carbsPer100g: carbsPer100g ? parseFloat(carbsPer100g) : null,
        fatPer100g: fatPer100g ? parseFloat(fatPer100g) : null,
        fiberPer100g: fiberPer100g ? parseFloat(fiberPer100g) : null,
        source: "CUSTOM",
        nutritionistId: profile.id,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, food });
  } catch (error) {
    console.error("Create custom food error:", error);
    return NextResponse.json({ error: "Erro ao criar alimento personalizado." }, { status: 500 });
  }
}
