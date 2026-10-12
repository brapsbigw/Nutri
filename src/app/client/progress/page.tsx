import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ClientProgressView } from "./client-progress-view";

export default async function ClientProgressPage() {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") {
    redirect("/login");
  }

  const client = await prisma.clientProfile.findUnique({
    where: { userId: session.userId },
    include: {
      measurements: {
        include: {
          measurementType: true,
        },
        orderBy: { measuredAt: "desc" },
      },
    },
  });

  if (!client) {
    redirect("/login");
  }

  const weightType = await prisma.measurementType.findFirst({
    where: { name: { contains: "Peso" } },
  });

  return (
    <ClientProgressView
      client={client}
      measurements={client.measurements}
      weightTypeId={weightType?.id || ""}
    />
  );
}
