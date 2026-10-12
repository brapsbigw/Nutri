import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NutritionistHeader } from "@/components/layout/nutritionist-header";
import { PlanBuilderView } from "./plan-builder-view";

export default async function NewPlanPage() {
  const session = await getSession();
  if (!session || session.role !== "NUTRITIONIST") {
    redirect("/login");
  }

  const profile = await prisma.nutritionistProfile.findUnique({
    where: { userId: session.userId },
  });

  const clients = await prisma.clientProfile.findMany({
    where: {
      nutritionistId: profile?.id || "",
      status: "ACTIVE",
      deletedAt: null,
    },
    orderBy: { name: "asc" },
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
        title="Novo Plano Alimentar"
        subtitle="Editor de prescrição nutricional"
        userRole={session.role}
      />
      <PlanBuilderView clients={clients} foods={foods} />
    </div>
  );
}
