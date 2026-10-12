import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ClientTodayView } from "./client-today-view";

export default async function ClientPage() {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") {
    redirect("/login");
  }

  const client = await prisma.clientProfile.findUnique({
    where: { userId: session.userId },
    include: {
      nutritionist: true,
      plans: {
        where: { status: "PUBLISHED" },
        include: {
          days: {
            include: {
              meals: {
                include: {
                  items: {
                    include: {
                      food: true,
                    },
                  },
                },
                orderBy: { orderIndex: "asc" },
              },
            },
            orderBy: { dayNumber: "asc" },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
      consultations: {
        where: {
          status: "SCHEDULED",
          scheduledAt: { gte: new Date() },
        },
        orderBy: { scheduledAt: "asc" },
        take: 1,
      },
      goals: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) {
    redirect("/login");
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const todayLogs = await prisma.mealLog.findMany({
    where: {
      clientId: client.id,
      logDate: todayStr,
    },
  });

  const activePlan = client.plans[0] || null;
  const nextConsultation = client.consultations[0] || null;

  return (
    <ClientTodayView
      client={client}
      activePlan={activePlan}
      todayLogs={todayLogs}
      nextConsultation={nextConsultation}
      activeGoals={client.goals}
    />
  );
}
