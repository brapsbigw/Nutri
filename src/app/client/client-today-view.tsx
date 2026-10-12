"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  MessageSquare,
  UtensilsCrossed,
  Target,
  ArrowRight,
  Droplets,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";

interface ClientTodayViewProps {
  client: any;
  activePlan: any;
  todayLogs: any[];
  nextConsultation: any;
  activeGoals: any[];
}

export function ClientTodayView({
  client,
  activePlan,
  todayLogs,
  nextConsultation,
  activeGoals,
}: ClientTodayViewProps) {
  const router = useRouter();

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia 👋" : hour < 19 ? "Boa tarde 🌤️" : "Boa noite 🌙";

  // Today string format
  const todayStr = new Date().toISOString().split("T")[0];

  // Meal Logs map
  const logsMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    todayLogs.forEach((l) => {
      map[l.mealId] = l;
    });
    return map;
  }, [todayLogs]);

  // Today's meals from active plan (Day 1 or matching day)
  const todayDay = activePlan?.days?.[0];
  const meals = todayDay?.meals || [];

  // Determine next pending meal
  const pendingMeal = meals.find((m: any) => !logsMap[m.id]);
  const activeMeal = pendingMeal || meals[0];

  // Meal log submission state
  const [submittingMealId, setSubmittingMealId] = React.useState<string | null>(null);
  const [optionalNote, setOptionalNote] = React.useState("");

  const handleLogMeal = async (
    mealId: string,
    status: "COMPLETED" | "PARTIAL" | "SKIPPED",
    planDayId: string
  ) => {
    setSubmittingMealId(mealId);
    try {
      const res = await fetch("/api/client/meal-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealId,
          planDayId,
          logDate: todayStr,
          status,
          note: optionalNote,
        }),
      });
      if (res.ok) {
        setOptionalNote("");
        router.refresh();
      }
    } finally {
      setSubmittingMealId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {greeting}, {client.name.split(" ")[0]}!
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Aqui está o teu plano para hoje. Lembra-te: o objetivo é a consistência, não a perfeição.
        </p>
      </div>

      {/* Today's Meals Adherence Strip */}
      {meals.length > 0 && (
        <Card className="border-emerald-100 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Refeições de Hoje
              </span>
              <span className="text-xs text-emerald-700 font-bold">
                {Object.keys(logsMap).length} de {meals.length} registadas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {meals.map((m: any) => {
                const log = logsMap[m.id];
                const isCompleted = log?.status === "COMPLETED";
                const isPartial = log?.status === "PARTIAL";
                const isSkipped = log?.status === "SKIPPED";

                return (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isCompleted
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                        : isPartial
                        ? "bg-amber-50/80 border-amber-300 text-amber-900"
                        : isSkipped
                        ? "bg-slate-100 border-slate-200 text-slate-500"
                        : "bg-white border-slate-200 text-slate-700 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-slate-400">
                        {m.scheduledTime || "--:--"}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : isPartial ? (
                        <span className="text-xs font-bold text-amber-600">~</span>
                      ) : (
                        <span className="h-3.5 w-3.5 rounded-full border border-slate-300 inline-block" />
                      )}
                    </div>
                    <p className="text-xs font-bold truncate">{m.name}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Meal Card */}
      {activeMeal && (
        <Card className="border-emerald-200 shadow-xs bg-white">
          <CardHeader className="bg-emerald-50/40 border-b border-emerald-100 py-3.5 px-5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🍽️</span>
              <div>
                <CardTitle className="text-base text-slate-900">
                  {logsMap[activeMeal.id] ? "Refeição Selecionada" : "Próxima Refeição"}
                </CardTitle>
                <p className="text-xs text-slate-500">{activeMeal.name}</p>
              </div>
            </div>
            {activeMeal.scheduledTime && (
              <span className="flex items-center gap-1 text-xs font-mono font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                <Clock className="h-3.5 w-3.5" />
                {activeMeal.scheduledTime}
              </span>
            )}
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Foods List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Alimentos e Porções Planeadas:
              </span>
              <ul className="divide-y divide-slate-100 bg-slate-50/50 rounded-xl p-3 border border-slate-200/60">
                {activeMeal.items?.map((item: any) => (
                  <li
                    key={item.id}
                    className="py-2 flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-800 font-medium">
                      {item.food ? item.food.name : "Alimento"}
                    </span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                      {item.quantity} {item.unit}
                    </span>
                  </li>
                ))}
              </ul>
              {activeMeal.instructions && (
                <p className="text-xs text-slate-600 italic bg-amber-50/50 border border-amber-200/60 p-2.5 rounded-lg">
                  💡 {activeMeal.instructions}
                </p>
              )}
            </div>

            {/* Quick Action Buttons */}
            {logsMap[activeMeal.id] ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-medium text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>
                    Já registaste esta refeição como{" "}
                    <strong>
                      {logsMap[activeMeal.id].status === "COMPLETED"
                        ? "Cumprida"
                        : logsMap[activeMeal.id].status === "PARTIAL"
                        ? "Parcial"
                        : "Não realizada"}
                    </strong>
                    .
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleLogMeal(activeMeal.id, "COMPLETED", activeMeal.planDayId)
                  }
                >
                  Atualizar
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <Input
                  placeholder="Nota ou ajuste do que comeste (opcional)..."
                  value={optionalNote}
                  onChange={(e) => setOptionalNote(e.target.value)}
                  className="text-xs"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    variant="primary"
                    className="gap-1.5"
                    isLoading={submittingMealId === activeMeal.id}
                    onClick={() =>
                      handleLogMeal(activeMeal.id, "COMPLETED", activeMeal.planDayId)
                    }
                  >
                    <Check className="h-4 w-4" />
                    <span>Cumprida ✓</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="text-slate-700"
                    isLoading={submittingMealId === activeMeal.id}
                    onClick={() =>
                      handleLogMeal(activeMeal.id, "PARTIAL", activeMeal.planDayId)
                    }
                  >
                    <span>Com alterações ~</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="text-slate-400 hover:text-rose-600"
                    isLoading={submittingMealId === activeMeal.id}
                    onClick={() =>
                      handleLogMeal(activeMeal.id, "SKIPPED", activeMeal.planDayId)
                    }
                  >
                    <span>Não realizada</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Two columns: Next Consultation & Goals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Next Consultation */}
        <Card>
          <CardHeader className="py-3.5 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Próxima Consulta</CardTitle>
              <Calendar className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            {nextConsultation ? (
              <div>
                <p className="text-base font-bold text-slate-900">
                  {formatDateTime(nextConsultation.scheduledAt)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Com {client.nutritionist.name} ({nextConsultation.durationMinutes} min)
                </p>
                {nextConsultation.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-2.5">
                    {nextConsultation.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-slate-500">
                  Ainda não tens uma nova consulta agendada.
                </p>
                <Link href="/client/messages">
                  <Button variant="outline" size="sm" className="mt-2 text-xs">
                    Contactar Nutricionista
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card>
          <CardHeader className="py-3.5 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Objetivos Ativos</CardTitle>
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 space-y-2">
            {activeGoals.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center">
                Sem objetivos ativos de momento.
              </p>
            ) : (
              activeGoals.slice(0, 2).map((g: any) => (
                <div
                  key={g.id}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {g.title}
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {g.targetValue ? `${g.targetValue} ${g.unit}` : "Hábito diário"}
                    </p>
                  </div>
                  <Badge variant="success">Em curso</Badge>
                </div>
              ))
            )}
            <Link
              href="/client/goals"
              className="text-xs font-semibold text-emerald-700 hover:underline block pt-1"
            >
              Ver todos os objetivos ➔
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Direct Contact Nutri Banner */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            💬
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Dúvidas ou dificuldades com o plano?
            </p>
            <p className="text-xs text-slate-500">
              Envia uma mensagem direta à Dra. Sofia Martins.
            </p>
          </div>
        </div>
        <Link href="/client/messages">
          <Button size="sm" variant="outline" className="gap-1">
            <span>Mensagens</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
