import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AdminDashboardView } from "./admin-dashboard-view";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const [
    totalUsers,
    nutritionistsCount,
    activeTrialsCount,
    activeSubscriptionsCount,
    trialKeys,
    nutritionists,
    subscriptions,
    auditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.nutritionistProfile.count(),
    prisma.trialKey.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.trialKey.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.nutritionistProfile.findMany({
      include: {
        user: true,
        clinic: true,
        subscription: { include: { plan: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findMany({
      include: {
        nutritionist: true,
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      include: {
        user: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const metrics = {
    totalUsers,
    nutritionistsCount,
    activeTrialsCount,
    activeSubscriptionsCount,
  };

  return (
    <AdminDashboardView
      metrics={metrics}
      trialKeys={trialKeys}
      nutritionists={nutritionists}
      subscriptions={subscriptions}
      auditLogs={auditLogs}
    />
  );
}
