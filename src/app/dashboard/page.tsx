import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDateTime, formatDate } from "@/lib/utils";
import { NutritionistHeader } from "@/components/layout/nutritionist-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Users,
  Calendar,
  UtensilsCrossed,
  MessageSquare,
  ArrowRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { QuickAddClientModal } from "@/components/clients/quick-add-client-modal";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  // Get nutritionist profile
  const profile = await prisma.nutritionistProfile.findUnique({
    where: { userId: session.userId },
    include: {
      clinic: true,
      subscription: { include: { plan: true } },
    },
  });

  const nutritionistId = profile?.id;

  // Active Clients count
  const activeClientsCount = await prisma.clientProfile.count({
    where: {
      nutritionistId: nutritionistId || "",
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  // Today's date range
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Today's consultations
  const todayConsultations = await prisma.consultation.findMany({
    where: {
      nutritionistId: nutritionistId || "",
      scheduledAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      client: true,
    },
    orderBy: { scheduledAt: "asc" },
  });

  // Upcoming consultations (next 7 days)
  const upcomingConsultations = await prisma.consultation.findMany({
    where: {
      nutritionistId: nutritionistId || "",
      scheduledAt: {
        gt: endOfDay,
        lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      client: true,
    },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  });

  // Draft plans
  const draftPlans = await prisma.nutritionPlan.findMany({
    where: {
      nutritionistId: nutritionistId || "",
      status: "DRAFT",
    },
    include: {
      client: true,
    },
    take: 4,
  });

  // Unread messages count
  const unreadMessagesCount = await prisma.message.count({
    where: {
      conversation: {
        nutritionistId: nutritionistId || "",
      },
      isRead: false,
      senderId: { not: session.userId },
    },
  });

  // Recent clients list
  const recentClients = await prisma.clientProfile.findMany({
    where: {
      nutritionistId: nutritionistId || "",
      deletedAt: null,
    },
    include: {
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
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <NutritionistHeader
        title={`Bem-vindo(a), ${profile?.name || session.name}`}
        subtitle={
          profile?.clinic
            ? `${profile.clinic.name} • Gestão Clínica`
            : "Consultório de Nutrição"
        }
        userRole={session.role}
        action={
          <div className="flex items-center gap-2">
            <QuickAddClientModal buttonLabel="Novo Cliente" />
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Card 1: Active Clients */}
          <Card className="hover:border-emerald-200 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Clientes Ativos
                </span>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {activeClientsCount}
                </span>
                <span className="text-xs text-slate-500">
                  de {profile?.subscription?.plan.maxClients || 50} permitidos
                </span>
              </div>
              <Link
                href="/clients"
                className="mt-4 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Ver todos os clientes</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Card 2: Today Consultations */}
          <Card className="hover:border-emerald-200 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Consultas Hoje
                </span>
                <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {todayConsultations.length}
                </span>
                <span className="text-xs text-slate-500">agendadas</span>
              </div>
              <Link
                href="/calendar"
                className="mt-4 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Abrir calendário</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Card 3: Draft Plans */}
          <Card className="hover:border-emerald-200 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Planos em Rascunho
                </span>
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {draftPlans.length}
                </span>
                <span className="text-xs text-slate-500">por publicar</span>
              </div>
              <Link
                href="/plans"
                className="mt-4 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Rever planos</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Card 4: Unread Messages */}
          <Card className="hover:border-emerald-200 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mensagens Não Lidas
                </span>
                <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {unreadMessagesCount}
                </span>
                <span className="text-xs text-slate-500">de clientes</span>
              </div>
              <Link
                href="/messages"
                className="mt-4 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Aceder à caixa de entrada</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Today's Consultations & Recent Clients */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today / Next Consultations Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle>Consultas de Hoje e Próximos Dias</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Agenda clínica sincronizada
                  </p>
                </div>
                <Link href="/calendar">
                  <Button variant="outline" size="sm">
                    Ver Calendário
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="pt-4">
                {todayConsultations.length === 0 && upcomingConsultations.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">
                    Não existem consultas agendadas para hoje ou próximos dias.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {todayConsultations.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                            HOJE
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {c.client.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDateTime(c.scheduledAt)} • {c.durationMinutes} min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="success">Agendada</Badge>
                          <Link
                            href={`/clients/${c.clientId}?tab=consultations&consultationId=${c.id}`}
                            className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs" })}
                          >
                            Ficha da Consulta
                          </Link>
                        </div>
                      </div>
                    ))}

                    {upcomingConsultations.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={c.client.name} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {c.client.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDateTime(c.scheduledAt)} ({c.durationMinutes} min)
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/clients/${c.clientId}?tab=consultations&consultationId=${c.id}`}
                          className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs gap-1" })}
                        >
                          <span>Ficha da Consulta</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Clients Quick Follow-up */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle>Clientes Recentes</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Acompanhamento contínuo e adesão
                  </p>
                </div>
                <Link href="/clients">
                  <Button variant="outline" size="sm">
                    Todos os Clientes
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="divide-y divide-slate-100">
                  {recentClients.map((client) => {
                    const activePlan = client.plans[0];
                    const logs = client.mealLogs;
                    const completedLogs = logs.filter((l) => l.status === "COMPLETED").length;
                    const adherenceRate = logs.length > 0 ? Math.round((completedLogs / logs.length) * 100) : null;

                    return (
                      <div
                        key={client.id}
                        className="py-3.5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={client.name} size="md" />
                          <div className="min-w-0">
                            <Link
                              href={`/clients/${client.id}`}
                              className="text-sm font-semibold text-slate-900 hover:text-emerald-700 truncate block"
                            >
                              {client.name}
                            </Link>
                            <p className="text-xs text-slate-500 truncate">
                              {activePlan ? activePlan.title : "Sem plano publicado"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          {adherenceRate !== null ? (
                            <div className="text-right">
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {adherenceRate}% adesão
                              </span>
                              <p className="text-[10px] text-slate-400 mt-0.5">refeições registadas</p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Sem registos</span>
                          )}

                          <Link
                            href={`/clients/${client.id}?tab=overview`}
                            className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1 text-xs" })}
                          >
                            <span>Ficha Clínica</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Quick Actions & Plans Requiring Attention */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <QuickAddClientModal
                  buttonLabel="Adicionar Novo Cliente"
                  buttonVariant="outline"
                  className="w-full justify-start gap-2.5 h-11 text-slate-700"
                  icon={<Users className="h-4 w-4 text-emerald-600" />}
                />

                <Link href="/plans" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2.5 h-11">
                    <UtensilsCrossed className="h-4 w-4 text-amber-600" />
                    <span>Criar / Editar Plano Alimentar</span>
                  </Button>
                </Link>

                <Link href="/calendar" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2.5 h-11">
                    <Calendar className="h-4 w-4 text-sky-600" />
                    <span>Agendar Nova Consulta</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Philosophy Reminder Card */}
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Filosofia de Acompanhamento</span>
              </div>
              <p className="text-xs text-emerald-900/80 mt-1.5 leading-relaxed font-medium">
                &ldquo;Acompanhar, não controlar.&rdquo;
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Utiliza as métricas e notas para compreender os padrões e desafios do cliente, criando um diálogo construtivo nas consultas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
