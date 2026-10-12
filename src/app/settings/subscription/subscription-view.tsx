"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SubscriptionViewProps {
  subscription: any;
  activeClientsCount: number;
  allPlans: any[];
}

export function SubscriptionView({
  subscription,
  activeClientsCount,
  allPlans,
}: SubscriptionViewProps) {
  const router = useRouter();
  const [upgradingSlug, setUpgradingSlug] = React.useState<string | null>(null);

  const currentPlan = subscription?.plan;
  const isTrial = subscription?.status === "TRIAL";
  const maxClients = currentPlan?.maxClients || 25;
  const clientUsagePercent = Math.min(
    100,
    Math.round((activeClientsCount / maxClients) * 100)
  );

  const handleSelectPlan = async (slug: string) => {
    if (slug === currentPlan?.slug) return;
    setUpgradingSlug(slug);

    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: slug }),
      });

      if (res.ok) {
        router.refresh();
      }
    } finally {
      setUpgradingSlug(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Subscrição & Limites da Conta
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Gere o teu plano profissional, limites de clientes e faturação
        </p>
      </div>

      {/* Current Subscription Status Card */}
      <Card className="border-emerald-200 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Plano Atual
                </span>
                <Badge variant={isTrial ? "warning" : "success"}>
                  {isTrial ? "Período de Trial" : "Subscrição Ativa"}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Plano {currentPlan?.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatCurrency(currentPlan?.priceMonthly || 0)} / mês • Próxima renovação:{" "}
                {formatDate(subscription?.currentPeriodEnd)}
              </p>
            </div>

            {isTrial && subscription?.trialKey && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-right">
                <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                  Chave de Trial Ativa
                </span>
                <span className="text-sm font-mono font-bold text-amber-950">
                  {subscription.trialKey.code}
                </span>
              </div>
            )}
          </div>

          {/* Usage Limit Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>Utilização de Clientes Ativos</span>
              </span>
              <span className="font-bold text-slate-900">
                {activeClientsCount} / {maxClients} ({clientUsagePercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all rounded-full ${
                  clientUsagePercent > 85
                    ? "bg-rose-500"
                    : clientUsagePercent > 60
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${clientUsagePercent}%` }}
              />
            </div>
            {clientUsagePercent >= 90 && (
              <p className="text-[11px] text-amber-700 font-semibold">
                ⚠️ Estás próximo do limite de clientes. Considera fazer upgrade para o plano seguinte.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans Comparison Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Planos Disponíveis na Plataforma
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {allPlans.map((p) => {
            const isCurrent = p.slug === currentPlan?.slug;
            const features = JSON.parse(p.features || "[]");

            return (
              <Card
                key={p.id}
                className={`flex flex-col justify-between transition-all ${
                  isCurrent
                    ? "border-2 border-emerald-500 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-900">{p.name}</h4>
                    {isCurrent && <Badge variant="success">Atual</Badge>}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {formatCurrency(p.priceMonthly)}
                    </span>
                    <span className="text-xs text-slate-500">/ mês</span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Até <strong>{p.maxClients} clientes ativos</strong> em simultâneo
                  </p>

                  <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    {features.map((feat: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4">
                    <Button
                      variant={isCurrent ? "outline" : "primary"}
                      className="w-full"
                      disabled={isCurrent}
                      isLoading={upgradingSlug === p.slug}
                      onClick={() => handleSelectPlan(p.slug)}
                    >
                      {isCurrent ? "Plano em Vigor" : "Escolher Este Plano"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
