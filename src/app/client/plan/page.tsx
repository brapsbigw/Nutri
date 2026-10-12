import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, UtensilsCrossed, Sparkles } from "lucide-react";

export default async function ClientPlanPage() {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") {
    redirect("/login");
  }

  const client = await prisma.clientProfile.findUnique({
    where: { userId: session.userId },
    include: {
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
                    orderBy: { orderIndex: "asc" },
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
    },
  });

  const plan = client?.plans[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          O Meu Plano Alimentar
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {plan ? plan.title : "A carregar plano..."}
        </p>
      </div>

      {!plan ? (
        <Card className="p-8 text-center bg-white">
          <p className="text-sm text-slate-500">
            Ainda não tens um plano alimentar publicado. O teu nutricionista está a preparar as tuas recomendações.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {plan.description && (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{plan.description}</p>
            </div>
          )}

          {plan.days.map((day) => (
            <div key={day.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  {day.label || `Dia ${day.dayNumber}`}
                </h2>
                {day.notes && (
                  <span className="text-xs text-slate-500">{day.notes}</span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {day.meals.map((meal) => (
                  <Card key={meal.id} className="border-slate-200 bg-white shadow-2xs">
                    <CardHeader className="py-3 px-4 bg-slate-50/60 border-b border-slate-100 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4 text-emerald-600" />
                        <span className="font-bold text-sm text-slate-900">
                          {meal.name}
                        </span>
                      </div>
                      {meal.scheduledTime && (
                        <span className="text-xs font-mono font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meal.scheduledTime}
                        </span>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <ul className="divide-y divide-slate-100 text-xs">
                        {meal.items.map((item) => (
                          <li
                            key={item.id}
                            className="py-2 flex items-center justify-between"
                          >
                            <span className="text-slate-800 font-medium">
                              {item.food?.name || "Alimento"}
                            </span>
                            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              {item.quantity} {item.unit}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {meal.instructions && (
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-xs text-slate-600 italic">
                            {meal.instructions}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
