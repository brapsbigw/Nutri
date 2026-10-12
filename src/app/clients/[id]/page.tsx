import * as React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NutritionistHeader } from "@/components/layout/nutritionist-header";
import { Button } from "@/components/ui/button";
import { ClientRecordView } from "./client-record-view";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const profile = await prisma.nutritionistProfile.findUnique({
    where: { userId: session.userId },
  });

  // Strict Tenant Isolation: Nutritionist can only view their own clients
  const client = await prisma.clientProfile.findFirst({
    where: {
      id,
      ...(session.role === "NUTRITIONIST" && profile ? { nutritionistId: profile.id } : {}),
      deletedAt: null,
    },
    include: {
      invite: true,
      plans: {
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
              },
            },
          },
        },
        orderBy: { version: "desc" },
      },
      consultations: {
        orderBy: { scheduledAt: "desc" },
      },
      measurements: {
        include: {
          measurementType: true,
        },
        orderBy: { measuredAt: "desc" },
      },
      goals: {
        include: {
          progress: {
            orderBy: { recordedAt: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
      },
      clinicalNotes: {
        orderBy: { createdAt: "desc" },
      },
      mealLogs: {
        include: {
          meal: true,
        },
        orderBy: { logDate: "desc" },
        take: 30,
      },
      conversations: {
        include: {
          messages: {
            include: {
              sender: { select: { id: true, email: true, role: true } },
            },
            orderBy: { createdAt: "asc" },
            take: 50,
          },
        },
      },
    },
  });

  if (!client) {
    notFound();
  }

  const measurementTypes = await prisma.measurementType.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div>
      <NutritionistHeader
        title={`Ficha Clínica • ${client.name}`}
        subtitle="Acompanhamento contínuo e histórico clínico"
        userRole={session.role}
        action={
          <Link href="/clients">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar aos Clientes</span>
            </Button>
          </Link>
        }
      />
      <React.Suspense fallback={<div className="p-8 text-center text-slate-500">A carregar ficha clínica...</div>}>
        <ClientRecordView client={client} measurementTypes={measurementTypes} />
      </React.Suspense>
    </div>
  );
}
