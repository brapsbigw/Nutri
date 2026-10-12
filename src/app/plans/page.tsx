import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { NutritionistHeader } from "@/components/layout/nutritionist-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, UtensilsCrossed, ArrowRight, Clock } from "lucide-react";

export default async function PlansPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.nutritionistProfile.findUnique({
    where: { userId: session.userId },
  });

  const plans = await prisma.nutritionPlan.findMany({
    where: {
      nutritionistId: profile?.id || "",
    },
    include: {
      client: true,
      days: {
        include: {
          meals: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <NutritionistHeader
        title="Planos Alimentares"
        subtitle="Criação e prescrição personalizada de planos nutricionais"
        userRole={session.role}
        action={
          <Link href="/plans/new">
            <Button size="sm" variant="primary" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Criar Novo Plano</span>
            </Button>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {plans.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed className="h-6 w-6" />}
            title="Ainda não tens planos alimentares"
            description="Cria um plano alimentar com dias, refeições e gramagens personalizadas para os teus clientes."
            action={
              <Link href="/plans/new">
                <Button variant="primary">Criar Primeiro Plano</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const totalMeals = plan.days.reduce(
                (acc, day) => acc + day.meals.length,
                0
              );

              return (
                <Card
                  key={plan.id}
                  className="hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {plan.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar name={plan.client.name} size="sm" />
                          <span className="text-xs font-semibold text-slate-600">
                            {plan.client.name}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          plan.status === "PUBLISHED"
                            ? "success"
                            : plan.status === "DRAFT"
                            ? "warning"
                            : "default"
                        }
                      >
                        {plan.status === "PUBLISHED"
                          ? "Publicado"
                          : plan.status === "DRAFT"
                          ? "Rascunho"
                          : "Arquivado"}
                      </Badge>
                    </div>

                    {plan.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {plan.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>{plan.days.length} dia(s)</span>
                      <span>•</span>
                      <span>{totalMeals} refeições</span>
                      <span>•</span>
                      <span>v{plan.version}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">
                        Atualizado: {formatDate(plan.updatedAt)}
                      </span>
                      <Link href={`/clients/${plan.clientId}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <span>Ver na Ficha</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
