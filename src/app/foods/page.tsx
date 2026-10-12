import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NutritionistHeader } from "@/components/layout/nutritionist-header";
import { FoodsView } from "./foods-view";

export default async function FoodsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.nutritionistProfile.findUnique({
    where: { userId: session.userId },
  });

  const foods = await prisma.food.findMany({
    where: {
      isActive: true,
      OR: [
        { source: "GLOBAL" },
        ...(profile ? [{ source: "CUSTOM", nutritionistId: profile.id }] : []),
      ],
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <NutritionistHeader
        title="Base de Alimentos"
        subtitle="Composição nutricional de referência e alimentos personalizados"
        userRole={session.role}
      />
      <FoodsView initialFoods={foods} />
    </div>
  );
}
