import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NutritionistHeader } from "@/components/layout/nutritionist-header";
import { SubscriptionView } from "./subscription-view";

export default async function SubscriptionPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.nutritionistProfile.findUnique({
    where: { userId: session.userId },
    include: {
      subscription: {
        include: {
          plan: true,
          trialKey: true,
        },
      },
    },
  });

  const activeClientsCount = await prisma.clientProfile.count({
    where: {
      nutritionistId: profile?.id || "",
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  const allPlans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: "asc" },
  });

  return (
    <div>
      <NutritionistHeader
        title="Subscrição & Limites"
        subtitle="Controlo de plano profissional e capacidade de clientes"
        userRole={session.role}
      />
      <SubscriptionView
        subscription={profile?.subscription}
        activeClientsCount={activeClientsCount}
        allPlans={allPlans}
      />
    </div>
  );
}
