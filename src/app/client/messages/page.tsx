import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ClientMessagesView } from "./client-messages-view";

export default async function ClientMessagesPage() {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") {
    redirect("/login");
  }

  const client = await prisma.clientProfile.findUnique({
    where: { userId: session.userId },
    include: {
      nutritionist: true,
      conversations: {
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
        take: 1,
      },
    },
  });

  if (!client) {
    redirect("/login");
  }

  let conversation = client.conversations[0];

  // If no conversation exists yet, automatically create one
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        nutritionistId: client.nutritionistId,
        clientId: client.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  return (
    <ClientMessagesView
      conversation={conversation}
      currentUserId={session.userId}
      nutritionistName={client.nutritionist.name}
    />
  );
}
