import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NutritionistHeader } from "@/components/layout/nutritionist-header";
import { MessagesInboxView } from "./messages-inbox-view";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.nutritionistProfile.findUnique({
    where: { userId: session.userId },
  });

  const conversations = await prisma.conversation.findMany({
    where: {
      nutritionistId: profile?.id || "",
    },
    include: {
      client: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <NutritionistHeader
        title="Comunicação Clínica"
        subtitle="Canal privado e encriptado com os teus clientes"
        userRole={session.role}
      />
      <MessagesInboxView
        conversations={conversations}
        currentUserId={session.userId}
      />
    </div>
  );
}
