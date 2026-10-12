"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Users,
  CreditCard,
  History,
  Plus,
  CheckCircle2,
  XCircle,
  Copy,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";

interface AdminDashboardViewProps {
  metrics: {
    totalUsers: number;
    nutritionistsCount: number;
    activeTrialsCount: number;
    activeSubscriptionsCount: number;
  };
  trialKeys: any[];
  nutritionists: any[];
  subscriptions: any[];
  auditLogs: any[];
}

export function AdminDashboardView({
  metrics,
  trialKeys,
  nutritionists,
  subscriptions,
  auditLogs,
}: AdminDashboardViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<
    "trial-keys" | "nutritionists" | "subscriptions" | "audit"
  >("trial-keys");

  // Modal State for Generating Trial Key
  const [modalOpen, setModalOpen] = React.useState(false);
  const [durationDays, setDurationDays] = React.useState("30");
  const [customCode, setCustomCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [createdKey, setCreatedKey] = React.useState<string | null>(null);

  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCreateTrialKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/trial-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationDays,
          customCode: customCode || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedKey(data.trialKey.code);
        setCustomCode("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserActive = async (userId: string, currentActive: boolean) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentActive }),
    });
    router.refresh();
  };

  const copyKey = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Utilizadores Totais
            </span>
            <span className="text-3xl font-extrabold text-slate-900 block mt-1">
              {metrics.totalUsers}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Nutricionistas Registados
            </span>
            <span className="text-3xl font-extrabold text-slate-900 block mt-1">
              {metrics.nutritionistsCount}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Chaves de Trial Ativas
            </span>
            <span className="text-3xl font-extrabold text-emerald-700 block mt-1">
              {metrics.activeTrialsCount}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Subscrições Ativas
            </span>
            <span className="text-3xl font-extrabold text-slate-900 block mt-1">
              {metrics.activeSubscriptionsCount}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Admin Privacy Shield Notice */}
      <div className="p-4 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Garantia de Privacidade Clínica:</strong> Por desenho arquitetural, este painel não tem acesso direto aos dados de saúde ou notas privadas dos clientes.
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: "trial-keys", label: "Chaves de Trial & Acesso", icon: KeyRound },
          { id: "nutritionists", label: "Nutricionistas & Contas", icon: Users },
          { id: "subscriptions", label: "Subscrições Globais", icon: CreditCard },
          { id: "audit", label: "Registo de Auditoria (Logs)", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
                isActive
                  ? "border-emerald-600 text-emerald-800 bg-white font-bold"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Trial Keys */}
      {activeTab === "trial-keys" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Chaves de Acesso e Trial
              </h2>
              <p className="text-xs text-slate-500">
                O registo de novos nutricionistas depende destas chaves criadas pelo admin
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setCreatedKey(null);
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Gerar Nova Chave</span>
            </Button>
          </div>

          <Card className="bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-6">Código da Chave</th>
                  <th className="py-3 px-4">Duração</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Ativada em</th>
                  <th className="py-3 px-4">Expira em</th>
                  <th className="py-3 px-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trialKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                      {k.code}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {k.durationDays} dias
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          k.status === "UNUSED"
                            ? "info"
                            : k.status === "ACTIVE"
                            ? "success"
                            : "default"
                        }
                      >
                        {k.status === "UNUSED"
                          ? "Disponível"
                          : k.status === "ACTIVE"
                          ? "Ativa em Uso"
                          : k.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(k.activatedAt)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(k.expiresAt)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyKey(k.code)}
                        className="text-[11px] gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copiedCode === k.code ? "Copiado" : "Copiar"}</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 2: Nutritionists */}
      {activeTab === "nutritionists" && (
        <Card className="bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-6">Nutricionista</th>
                <th className="py-3 px-4">Cédula</th>
                <th className="py-3 px-4">Clínica</th>
                <th className="py-3 px-4">Plano Atual</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nutritionists.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-6">
                    <p className="font-bold text-slate-900">{n.name}</p>
                    <p className="text-slate-500">{n.user.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {n.licenseNumber || "-"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {n.clinic?.name || "Independente"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">
                      {n.subscription?.plan.name || "Sem plano"}
                    </span>{" "}
                    ({n.subscription?.status})
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={n.user.isActive ? "success" : "danger"}>
                      {n.user.isActive ? "Ativa" : "Desativada"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Button
                      size="sm"
                      variant={n.user.isActive ? "outline" : "primary"}
                      onClick={() =>
                        handleToggleUserActive(n.user.id, n.user.isActive)
                      }
                      className="text-[11px]"
                    >
                      {n.user.isActive ? "Desativar" : "Reativar"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* TAB 3: Subscriptions */}
      {activeTab === "subscriptions" && (
        <Card className="bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-6">Nutricionista</th>
                <th className="py-3 px-4">Plano</th>
                <th className="py-3 px-4">Preço Mensal</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-6">Período Vigente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-6 font-bold text-slate-900">
                    {s.nutritionist.name}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {s.plan.name}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatCurrency(s.plan.priceMonthly)}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={s.status === "ACTIVE" ? "success" : "warning"}>
                      {s.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-6 text-slate-500">
                    {formatDate(s.currentPeriodStart)} até{" "}
                    {formatDate(s.currentPeriodEnd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* TAB 4: Audit Logs */}
      {activeTab === "audit" && (
        <Card className="bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-4">Ação</th>
                <th className="py-3 px-4">Entidade</th>
                <th className="py-3 px-4">Utilizador</th>
                <th className="py-3 px-6">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-6 text-slate-500 font-mono">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{log.entityType}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {log.user?.email || "Sistema"}
                  </td>
                  <td className="py-3 px-6 text-slate-400 font-mono text-[11px] truncate max-w-xs">
                    {log.metadata || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal Generate Trial Key */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Gerar Nova Chave de Trial"
        description="Emite uma chave autorizada para ativação de conta de nutricionista"
      >
        {createdKey ? (
          <div className="text-center py-4 space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Chave Gerada com Sucesso!
            </h3>
            <div className="p-3 bg-slate-50 border-2 border-dashed border-emerald-300 rounded-xl max-w-xs mx-auto flex items-center justify-between">
              <span className="font-mono font-bold text-lg text-emerald-800">
                {createdKey}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyKey(createdKey)}
              >
                Copiar
              </Button>
            </div>
            <Button
              variant="primary"
              className="mt-2"
              onClick={() => setModalOpen(false)}
            >
              Concluído
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateTrialKey} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Duração do Trial (Dias)
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="14">14 dias (2 semanas)</option>
                <option value="30">30 dias (1 mês)</option>
                <option value="60">60 dias (2 meses)</option>
                <option value="90">90 dias (3 meses)</option>
              </select>
            </div>

            <Input
              label="Código Personalizado (Opcional)"
              placeholder="ex: TRIAL-CLINICA-2026 (deixar vazio para auto)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Gerar Chave
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
