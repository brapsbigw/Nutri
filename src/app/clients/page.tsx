import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { NutritionistHeader } from "@/components/layout/nutritionist-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Users, Search, ArrowRight, UserPlus, FileText } from "lucide-react";
import { QuickAddClientModal } from "@/components/clients/quick-add-client-modal";

export default async function ClientsPage() {
  const session = await getSession();
  if (!session) return null;

  const profile = await prisma.nutritionistProfile.findUnique({
    where: { userId: session.userId },
  });

  const clients = await prisma.clientProfile.findMany({
    where: {
      nutritionistId: profile?.id || "",
      deletedAt: null,
    },
    include: {
      invite: true,
      plans: {
        where: { status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
      consultations: {
        orderBy: { scheduledAt: "desc" },
        take: 1,
      },
      mealLogs: {
        take: 14,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <NutritionistHeader
        title="Gestão de Clientes"
        subtitle={`${clients.length} clientes registados na tua prática clínica`}
        userRole={session.role}
        action={
          <div className="flex items-center gap-2">
            <QuickAddClientModal buttonLabel="Adicionar Cliente" size="sm" />
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {clients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="Ainda não tens clientes"
            description="Cria a ficha do teu primeiro cliente e gera o código de convite para ele aceder à plataforma."
            action={
              <Link href="/clients/new">
                <Button variant="primary">Criar Primeiro Cliente</Button>
              </Link>
            }
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold">
                    <th className="py-3.5 px-6">Cliente</th>
                    <th className="py-3.5 px-6">Plano Atual</th>
                    <th className="py-3.5 px-6">Última Consulta</th>
                    <th className="py-3.5 px-6">Adesão (Recente)</th>
                    <th className="py-3.5 px-6">Estado / Acesso</th>
                    <th className="py-3.5 px-6 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((client) => {
                    const activePlan = client.plans[0];
                    const lastConsultation = client.consultations[0];
                    const logs = client.mealLogs;
                    const completed = logs.filter((l) => l.status === "COMPLETED").length;
                    const adherenceRate = logs.length > 0 ? Math.round((completed / logs.length) * 100) : null;

                    const isAccountLinked = !!client.userId;
                    const invite = client.invite;

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Name & Contact */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar name={client.name} size="md" />
                            <div>
                              <Link
                                href={`/clients/${client.id}`}
                                className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors"
                              >
                                {client.name}
                              </Link>
                              <p className="text-xs text-slate-500">
                                {client.email || client.phone || "Sem contacto"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-4 px-6">
                          {activePlan ? (
                            <span className="font-medium text-slate-800">
                              {activePlan.title}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              Sem plano publicado
                            </span>
                          )}
                        </td>

                        {/* Last Consultation */}
                        <td className="py-4 px-6 text-slate-600">
                          {lastConsultation ? (
                            <div>
                              <p className="font-medium text-slate-800">
                                {formatDate(lastConsultation.scheduledAt)}
                              </p>
                              <p className="text-xs text-slate-400">
                                {lastConsultation.status === "COMPLETED"
                                  ? "Realizada"
                                  : "Agendada"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>

                        {/* Adherence */}
                        <td className="py-4 px-6">
                          {adherenceRate !== null ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                  adherenceRate >= 80
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : adherenceRate >= 50
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                              >
                                {adherenceRate}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Sem registos</span>
                          )}
                        </td>

                        {/* Status / Invite */}
                        <td className="py-4 px-6">
                          {isAccountLinked ? (
                            <Badge variant="success">Conta Ativa</Badge>
                          ) : invite ? (
                            <div className="flex flex-col items-start gap-1">
                              <Badge variant="warning">Convite Pendente</Badge>
                              <span className="text-[11px] font-mono text-slate-500">
                                {invite.code}
                              </span>
                            </div>
                          ) : (
                            <Badge variant="default">Sem convite</Badge>
                          )}
                        </td>

                        {/* Action CTA */}
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/clients/${client.id}?tab=overview`}
                            className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1" })}
                          >
                            <span>Ficha Clínica</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
