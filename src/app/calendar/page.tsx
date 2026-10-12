import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NutritionistHeader } from "@/components/layout/nutritionist-header";
import { CalendarView } from "./calendar-view";

export default async function CalendarPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.nutritionistProfile.findUnique({
    where: { userId: session.userId },
  });

  const consultations = await prisma.consultation.findMany({
    where: {
      nutritionistId: profile?.id || "",
    },
    include: {
      client: true,
    },
    orderBy: { scheduledAt: "desc" },
  });

  const clients = await prisma.clientProfile.findMany({
    where: {
      nutritionistId: profile?.id || "",
      status: "ACTIVE",
      deletedAt: null,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <NutritionistHeader
        title="Agenda e Calendário"
        subtitle="Sincronização de consultas clínicas"
        userRole={session.role}
      />
      <CalendarView consultations={consultations} clients={clients} />
    </div>
  );
}
