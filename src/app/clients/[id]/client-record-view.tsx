"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  Calendar,
  UtensilsCrossed,
  Target,
  FileText,
  MessageSquare,
  TrendingUp,
  Plus,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  User,
  ShieldCheck,
  Scale,
  HeartPulse,
  Flame,
  ChevronRight,
  ExternalLink,
  Edit3,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatDate, formatDateTime } from "@/lib/utils";

interface ClientRecordViewProps {
  client: any;
  measurementTypes: any[];
}

export function ClientRecordView({ client, measurementTypes }: ClientRecordViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlTab = searchParams.get("tab");
  const urlConsultationId = searchParams.get("consultationId");

  const [activeTab, setActiveTab] = React.useState<
    | "overview"
    | "timeline"
    | "plan"
    | "consultations"
    | "measurements"
    | "goals"
    | "adherence"
    | "notes"
    | "messages"
  >(
    (urlTab as any) || "overview"
  );

  // Modals state
  const [noteModalOpen, setNoteModalOpen] = React.useState(false);
  const [noteTitle, setNoteTitle] = React.useState("");
  const [noteContent, setNoteContent] = React.useState("");
  const [noteLoading, setNoteLoading] = React.useState(false);

  const [measurementModalOpen, setMeasurementModalOpen] = React.useState(false);
  const [selectedTypeId, setSelectedTypeId] = React.useState(measurementTypes[0]?.id || "");
  const [measurementValue, setMeasurementValue] = React.useState("");
  const [measurementNotes, setMeasurementNotes] = React.useState("");
  const [measurementLoading, setMeasurementLoading] = React.useState(false);

  const [consultationModalOpen, setConsultationModalOpen] = React.useState(false);
  const [consultationDate, setConsultationDate] = React.useState("");
  const [consultationDuration, setConsultationDuration] = React.useState("45");
  const [consultationNotes, setConsultationNotes] = React.useState("");
  const [consultationLoading, setConsultationLoading] = React.useState(false);

  // Consultation Sheet / Detail Modal
  const [selectedConsultation, setSelectedConsultation] = React.useState<any | null>(null);
  const [editConsultationNotes, setEditConsultationNotes] = React.useState("");
  const [editConsultationObs, setEditConsultationObs] = React.useState("");
  const [editConsultationStatus, setEditConsultationStatus] = React.useState("SCHEDULED");
  const [savingConsultation, setSavingConsultation] = React.useState(false);

  const [copied, setCopied] = React.useState(false);

  // Auto-open consultation from query param if provided
  React.useEffect(() => {
    if (urlConsultationId && client.consultations) {
      const match = client.consultations.find((c: any) => c.id === urlConsultationId);
      if (match) {
        openConsultationSheet(match);
      }
    }
  }, [urlConsultationId, client.consultations]);

  const openConsultationSheet = (c: any) => {
    setSelectedConsultation(c);
    setEditConsultationNotes(c.notes || "");
    setEditConsultationObs(c.observations || "");
    setEditConsultationStatus(c.status || "SCHEDULED");
  };

  const handleUpdateConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultation) return;
    setSavingConsultation(true);
    try {
      const res = await fetch(`/api/consultations/${selectedConsultation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editConsultationStatus,
          notes: editConsultationNotes,
          observations: editConsultationObs,
        }),
      });
      if (res.ok) {
        setSelectedConsultation(null);
        router.refresh();
      }
    } finally {
      setSavingConsultation(false);
    }
  };

  const activePlan = client.plans.find((p: any) => p.status === "PUBLISHED") || client.plans[0];
  const logs = client.mealLogs || [];
  const completedLogs = logs.filter((l: any) => l.status === "COMPLETED").length;
  const adherenceRate = logs.length > 0 ? Math.round((completedLogs / logs.length) * 100) : null;

  // Biometric & Anthropometric Calculations
  const latestWeight = client.measurements?.find((m: any) =>
    m.measurementType?.name?.toLowerCase().includes("peso")
  )?.value;
  const latestHeight = client.measurements?.find((m: any) =>
    m.measurementType?.name?.toLowerCase().includes("altura")
  )?.value;
  const latestBodyFat = client.measurements?.find((m: any) =>
    m.measurementType?.name?.toLowerCase().includes("gordura") ||
    m.measurementType?.name?.toLowerCase().includes("fat")
  )?.value;
  const latestMuscle = client.measurements?.find((m: any) =>
    m.measurementType?.name?.toLowerCase().includes("muscular")
  )?.value;

  let bmi: number | null = null;
  let bmiCategory = "";
  let bmiBadgeVariant: "success" | "warning" | "danger" | "default" = "default";

  if (latestWeight && latestHeight) {
    const heightM = latestHeight > 3 ? latestHeight / 100 : latestHeight;
    bmi = parseFloat((latestWeight / (heightM * heightM)).toFixed(1));
    if (bmi < 18.5) {
      bmiCategory = "Abaixo do peso (< 18.5)";
      bmiBadgeVariant = "default";
    } else if (bmi < 25) {
      bmiCategory = "Peso Saudável / Eutrofia (18.5 - 24.9)";
      bmiBadgeVariant = "success";
    } else if (bmi < 30) {
      bmiCategory = "Pré-obesidade / Excesso (25 - 29.9)";
      bmiBadgeVariant = "warning";
    } else {
      bmiCategory = "Obesidade (≥ 30)";
      bmiBadgeVariant = "danger";
    }
  }

  // Consultations
  const upcomingConsultations =
    client.consultations?.filter(
      (c: any) => new Date(c.scheduledAt) >= new Date() && c.status !== "CANCELLED"
    ) || [];
  const pastConsultations =
    client.consultations?.filter(
      (c: any) => new Date(c.scheduledAt) < new Date() || c.status === "COMPLETED"
    ) || [];
  const nextConsultation = upcomingConsultations[0];
  const lastConsultation = pastConsultations[0];

  // Build Chronological Timeline Events
  const timelineEvents = React.useMemo(() => {
    const events: any[] = [];

    client.consultations?.forEach((c: any) => {
      events.push({
        id: `c-${c.id}`,
        date: new Date(c.scheduledAt),
        type: "CONSULTATION",
        title: `Consulta (${c.status === "COMPLETED" ? "Realizada" : "Agendada"})`,
        description: c.notes || c.observations || "Sem notas adicionais.",
        author: "Nutricionista",
        raw: c,
      });
    });

    client.measurements?.forEach((m: any) => {
      events.push({
        id: `m-${m.id}`,
        date: new Date(m.measuredAt),
        type: "MEASUREMENT",
        title: `Medição: ${m.measurementType?.name || "Parâmetro"}`,
        description: `${m.value} ${m.unit} — ${
          m.recordedByRole === "NUTRITIONIST"
            ? "Registado em Consulta pelo Nutricionista"
            : "Auto-reportado pelo Cliente"
        }`,
        author: m.recordedByRole === "NUTRITIONIST" ? "Nutricionista" : "Cliente",
      });
    });

    (client.clinicalNotes || []).forEach((n: any) => {
      events.push({
        id: `n-${n.id}`,
        date: new Date(n.createdAt),
        type: "NOTE",
        title: n.title ? `Nota Privada: ${n.title}` : "Nota Clínica Privada",
        description: n.content,
        author: "Nutricionista",
        isPrivate: true,
      });
    });

    client.plans?.forEach((p: any) => {
      events.push({
        id: `p-${p.id}`,
        date: new Date(p.createdAt),
        type: "PLAN",
        title: `Plano Alimentar (${p.status})`,
        description: p.title,
        author: "Nutricionista",
      });
    });

    events.sort((a, b) => b.date.getTime() - a.date.getTime());
    return events;
  }, [client]);

  // Handle Note Submit
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent) return;
    setNoteLoading(true);
    try {
      const res = await fetch(`/api/clients/${client.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: noteTitle, content: noteContent }),
      });
      if (res.ok) {
        setNoteModalOpen(false);
        setNoteTitle("");
        setNoteContent("");
        router.refresh();
      }
    } finally {
      setNoteLoading(false);
    }
  };

  // Handle Measurement Submit
  const handleCreateMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeId || !measurementValue) return;
    setMeasurementLoading(true);
    const selectedType = measurementTypes.find((t) => t.id === selectedTypeId);
    try {
      const res = await fetch(`/api/clients/${client.id}/measurements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          measurementTypeId: selectedTypeId,
          value: parseFloat(measurementValue),
          unit: selectedType?.unit || "kg",
          notes: measurementNotes,
        }),
      });
      if (res.ok) {
        setMeasurementModalOpen(false);
        setMeasurementValue("");
        setMeasurementNotes("");
        router.refresh();
      }
    } finally {
      setMeasurementLoading(false);
    }
  };

  // Handle Consultation Submit
  const handleCreateConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationDate) return;
    setConsultationLoading(true);
    try {
      const res = await fetch(`/api/clients/${client.id}/consultations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt: consultationDate,
          durationMinutes: parseInt(consultationDuration, 10) || 45,
          notes: consultationNotes,
        }),
      });
      if (res.ok) {
        setConsultationModalOpen(false);
        setConsultationDate("");
        setConsultationNotes("");
        router.refresh();
      }
    } finally {
      setConsultationLoading(false);
    }
  };

  const copyInvite = () => {
    if (client.invite?.code) {
      navigator.clipboard.writeText(client.invite.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
      {/* Top Patient Header Card */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar name={client.name} size="xl" />
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
                  {client.userId ? (
                    <Badge variant="success">Conta Ativa (App Móvel)</Badge>
                  ) : (
                    <Badge variant="warning">Convite Pendente</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {client.email || "Sem e-mail"} • {client.phone || "Sem telefone"} • Entrada:{" "}
                  {formatDate(client.joinedAt)}
                </p>
                {client.notes && (
                  <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 mt-2 inline-block max-w-xl truncate">
                    🎯 Objetivo Clínico: {client.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {client.invite && !client.userId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyInvite}
                  className="gap-1.5 font-mono text-xs"
                >
                  <Copy className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{copied ? "Copiado!" : client.invite.code}</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setMeasurementModalOpen(true)}
                className="gap-1.5"
              >
                <Activity className="h-4 w-4 text-emerald-600" />
                <span>+ Medição</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setNoteModalOpen(true)}
                className="gap-1.5"
              >
                <Lock className="h-3.5 w-3.5 text-amber-600" />
                <span>+ Nota Confidencial</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setConsultationModalOpen(true)}
                className="gap-1.5"
              >
                <Calendar className="h-4 w-4" />
                <span>Agendar Consulta</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Plano Ativo
              </span>
              <span className="text-sm font-bold text-slate-900 truncate block mt-0.5">
                {activePlan ? activePlan.title : "Sem plano publicado"}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Adesão Registada
              </span>
              <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                {adherenceRate !== null ? `${adherenceRate}% das refeições` : "Sem registos"}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                IMC Atual
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                {bmi ? `${bmi} kg/m²` : latestWeight ? `${latestWeight} kg` : "Por avaliar"}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Consultas Realizadas
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                {client.consultations.filter((c: any) => c.status === "COMPLETED").length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: "overview", label: "Ficha Clínica Geral", icon: FileText },
          { id: "consultations", label: "Consultas & Agenda", icon: Calendar },
          { id: "plan", label: "Plano Alimentar", icon: UtensilsCrossed },
          { id: "measurements", label: "Medidas & Composição", icon: Activity },
          { id: "goals", label: "Objetivos & Metas", icon: Target },
          { id: "adherence", label: "Adesão às Refeições", icon: TrendingUp },
          { id: "timeline", label: "Linha Temporal", icon: Clock },
          { id: "notes", label: "Notas Confidenciais", icon: Lock },
          { id: "messages", label: "Mensagens", icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 shrink-0 cursor-pointer ${
                isActive
                  ? "border-emerald-600 text-emerald-800 bg-emerald-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: FICHA CLÍNICA GERAL (OVERVIEW)                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1 & 2: Biometria, Anamnese, Plano Atual */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card: Avaliação Antropométrica & IMC */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-base">Avaliação Antropométrica & IMC</CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMeasurementModalOpen(true)}
                  className="gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Nova Medição</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Peso</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {latestWeight ? `${latestWeight} kg` : "—"}
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Altura</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {latestHeight ? `${latestHeight} cm` : "—"}
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">% Gordura</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {latestBodyFat ? `${latestBodyFat}%` : "—"}
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Massa Muscular</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {latestMuscle ? `${latestMuscle} kg` : "—"}
                    </p>
                  </div>
                </div>

                {/* BMI Gauge / Banner */}
                {bmi ? (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Índice de Massa Corporal (IMC)
                        </span>
                        <Badge variant={bmiBadgeVariant}>{bmiCategory}</Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Valor calculado: <strong className="text-slate-900">{bmi} kg/m²</strong> • Classificação padrão OMS
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActiveTab("measurements")}
                      className="text-emerald-700 hover:text-emerald-800 text-xs gap-1"
                    >
                      <span>Ver evolução</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                    <span>Regista o Peso e a Altura deste cliente para calcular o IMC automaticamente.</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMeasurementModalOpen(true)}
                      className="text-xs shrink-0"
                    >
                      Registar Medidas
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card: Resumo do Plano Alimentar Ativo */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-amber-600" />
                  <div>
                    <CardTitle className="text-base">
                      {activePlan ? activePlan.title : "Sem Plano Alimentar"}
                    </CardTitle>
                    {activePlan && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Versão {activePlan.version} • {activePlan.status === "PUBLISHED" ? "Publicado e Ativo" : "Rascunho"}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("plan")}
                  className="gap-1 text-xs"
                >
                  <span>Ver Detalhes do Plano</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                {activePlan ? (
                  <div className="space-y-4">
                    {/* Targets Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-100">
                        <span className="text-[10px] font-semibold text-amber-800 uppercase">Calorias Alvo</span>
                        <p className="text-base font-bold text-slate-900 mt-0.5">
                          {activePlan.calorieTarget ? `${activePlan.calorieTarget} kcal` : "N/D"}
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Proteína</span>
                        <p className="text-base font-bold text-slate-900 mt-0.5">
                          {activePlan.proteinTarget ? `${activePlan.proteinTarget} g` : "—"}
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Hidratos</span>
                        <p className="text-base font-bold text-slate-900 mt-0.5">
                          {activePlan.carbsTarget ? `${activePlan.carbsTarget} g` : "—"}
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Gorduras</span>
                        <p className="text-base font-bold text-slate-900 mt-0.5">
                          {activePlan.fatTarget ? `${activePlan.fatTarget} g` : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Meal list preview */}
                    {activePlan.days && activePlan.days[0]?.meals?.length > 0 && (
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                        {activePlan.days[0].meals.slice(0, 4).map((m: any) => (
                          <div key={m.id} className="p-3 bg-white flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">{m.name}</span>
                            <span className="text-slate-500 font-mono">{m.scheduledTime || "Flexível"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p>Este cliente ainda não tem um plano alimentar associado.</p>
                    <Link href={`/plans/new?clientId=${client.id}`} className="mt-3 inline-block">
                      <Button size="sm" variant="primary">Criar Plano Alimentar</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Col 3: Consultas & Notas Clínicas Confidenciais */}
          <div className="space-y-6">
            {/* Card: Consultas Rápidas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-sky-600" />
                  <CardTitle className="text-base">Consultas</CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConsultationModalOpen(true)}
                  className="gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Agendar</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {nextConsultation ? (
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Próxima Consulta
                      </span>
                      <Badge variant="success">Agendada</Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {formatDateTime(nextConsultation.scheduledAt)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Duração prevista: {nextConsultation.durationMinutes} minutos
                    </p>
                    {nextConsultation.notes && (
                      <p className="text-xs text-slate-600 mt-2 bg-white/70 p-2 rounded-lg border border-emerald-100">
                        {nextConsultation.notes}
                      </p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConsultationSheet(nextConsultation)}
                      className="w-full mt-3 text-xs bg-white"
                    >
                      Abrir Ficha da Consulta
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    Nenhuma consulta futura agendada.
                  </p>
                )}

                {lastConsultation && (
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Última Consulta
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      {formatDateTime(lastConsultation.scheduledAt)}
                    </p>
                    {lastConsultation.observations && (
                      <p className="text-xs text-slate-600 mt-1 italic line-clamp-2">
                        "{lastConsultation.observations}"
                      </p>
                    )}
                    <button
                      onClick={() => openConsultationSheet(lastConsultation)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold mt-2 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver ficha da consulta</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card: Notas Médicas Confidenciais */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-base">Notas Confidenciais</CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNoteModalOpen(true)}
                  className="gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Adicionar</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <p className="text-[11px] text-slate-400">
                  Apenas visíveis para o nutricionista. O cliente nunca tem acesso a estas notas.
                </p>
                {client.clinicalNotes?.length > 0 ? (
                  client.clinicalNotes.slice(0, 3).map((n: any) => (
                    <div key={n.id} className="p-3 bg-amber-50/40 border border-amber-200/60 rounded-xl text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold text-amber-900">{n.title || "Nota Clínica"}</span>
                        <span>{formatDate(n.createdAt)}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{n.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    Ainda sem notas confidenciais registadas.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: CONSULTAS & AGENDA (COM FICHA DA CONSULTA DETALHADA)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "consultations" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Histórico de Consultas Clínicas</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Clica em qualquer consulta para abrir a Ficha da Consulta, registar queixas e conduta nutricional.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setConsultationModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Agendar Nova Consulta</span>
            </Button>
          </CardHeader>
          <CardContent>
            {client.consultations?.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Ainda não existem consultas agendadas ou realizadas para este cliente.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {client.consultations?.map((c: any) => (
                  <div
                    key={c.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 px-3 rounded-xl transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          {formatDateTime(c.scheduledAt)}
                        </p>
                        <span className="text-xs text-slate-500 font-mono">({c.durationMinutes} min)</span>
                        <Badge variant={c.status === "COMPLETED" ? "success" : c.status === "CANCELLED" ? "danger" : "default"}>
                          {c.status === "COMPLETED" ? "Realizada" : c.status === "CANCELLED" ? "Cancelada" : "Agendada"}
                        </Badge>
                      </div>
                      {c.notes && (
                        <p className="text-xs text-slate-600 mt-1">
                          <strong>Notas / Queixas:</strong> {c.notes}
                        </p>
                      )}
                      {c.observations && (
                        <p className="text-xs text-slate-500 mt-0.5 italic">
                          <strong>Conduta / Observações:</strong> {c.observations}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConsultationSheet(c)}
                      className="shrink-0 gap-1.5"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Ficha da Consulta</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: PLANO ALIMENTAR                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "plan" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {activePlan ? activePlan.title : "Sem Plano Alimentar"}
              </h3>
              {activePlan?.description && (
                <p className="text-xs text-slate-500 mt-0.5">{activePlan.description}</p>
              )}
            </div>
            <Link href={`/plans`}>
              <Button size="sm" variant="outline">
                Gerir no Editor de Planos
              </Button>
            </Link>
          </div>

          {activePlan?.days?.map((day: any) => (
            <div key={day.id} className="space-y-3">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {day.label || `Dia ${day.dayNumber}`}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {day.meals?.map((meal: any) => (
                  <Card key={meal.id} className="border-slate-200">
                    <CardHeader className="py-3 px-4 bg-slate-50/50 flex flex-row items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900">
                        {meal.name}
                      </span>
                      {meal.scheduledTime && (
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" />
                          {meal.scheduledTime}
                        </span>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      <ul className="divide-y divide-slate-100 text-xs text-slate-700">
                        {meal.items?.map((item: any) => (
                          <li key={item.id} className="py-1.5 flex justify-between">
                            <span>{item.food ? item.food.name : item.customFoodName || "Alimento"}</span>
                            <span className="font-semibold text-slate-900">
                              {item.quantity} {item.unit}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {meal.instructions && (
                        <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-100">
                          {meal.instructions}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 4: MEDIÇÕES & COMPOSIÇÃO                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "measurements" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Medições e Composição Corporal</CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Distinção estrita entre medições em consulta e auto-reportadas
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setMeasurementModalOpen(true)}
            >
              + Registar Medição
            </Button>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5">Data</th>
                  <th className="py-2.5">Medição</th>
                  <th className="py-2.5">Valor</th>
                  <th className="py-2.5">Origem / Autor</th>
                  <th className="py-2.5">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {client.measurements?.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 text-slate-600">{formatDate(m.measuredAt)}</td>
                    <td className="py-3 font-semibold text-slate-900">
                      {m.measurementType?.name || "Medição"}
                    </td>
                    <td className="py-3 text-emerald-800 font-bold">
                      {m.value} {m.unit}
                    </td>
                    <td className="py-3">
                      {m.recordedByRole === "NUTRITIONIST" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          🩺 Nutricionista (Em Consulta)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          📱 Cliente (Auto-reportado)
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-500">{m.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 5: OBJETIVOS                                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "goals" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Objetivos do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.goals?.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">Nenhum objetivo definido.</p>
            ) : (
              client.goals?.map((g: any) => (
                <div
                  key={g.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{g.title}</p>
                    {g.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{g.description}</p>
                    )}
                    <p className="text-xs text-emerald-700 font-medium mt-1">
                      Alvo: {g.targetValue ? `${g.targetValue} ${g.unit || ""}` : "Qualitativo"} •{" "}
                      Frequência: {g.frequency}
                    </p>
                  </div>
                  <Badge variant={g.status === "ACTIVE" ? "success" : "default"}>
                    {g.status === "ACTIVE" ? "Em Curso" : "Concluído"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 6: ADESÃO ÀS REFEIÇÕES                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "adherence" && (
        <Card>
          <CardHeader>
            <CardTitle>Adesão Real às Refeições (Sem Culpa)</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">O cliente ainda não registou refeições.</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">
                        {log.meal?.name || "Refeição"}
                      </span>
                      <span className="text-slate-400 ml-2">{formatDate(log.logDate)}</span>
                      {log.note && <p className="text-slate-500 mt-1 italic">"{log.note}"</p>}
                    </div>
                    <Badge
                      variant={
                        log.status === "COMPLETED"
                          ? "success"
                          : log.status === "SKIPPED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {log.status === "COMPLETED"
                        ? "Feita"
                        : log.status === "SKIPPED"
                        ? "Não realizada"
                        : "Modificada"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 7: LINHA TEMPORAL                                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Histórico Clínico Unificado
            </h3>
            <span className="text-xs text-slate-400">
              {timelineEvents.length} eventos registados
            </span>
          </div>

          {timelineEvents.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
              Ainda não existem eventos na ficha deste cliente.
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-emerald-100 space-y-6">
              {timelineEvents.map((event) => (
                <div key={event.id} className="relative group">
                  <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-600 shadow-2xs" />
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {event.title}
                        </span>
                        {event.isPrivate && (
                          <Badge variant="warning">Privado (Confidencial)</Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatDateTime(event.date)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {event.description}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Autor: {event.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 8: NOTAS CONFIDENCIAIS                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "notes" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Notas Médicas Privadas (Apenas Nutricionista)</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Garantia estrita de confidencialidade clínica. O cliente não tem visibilidade.
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setNoteModalOpen(true)}>
              + Adicionar Nota Privada
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.clinicalNotes?.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">Nenhuma nota privada guardada.</p>
            ) : (
              client.clinicalNotes?.map((n: any) => (
                <div key={n.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{n.title || "Nota"}</span>
                    <span className="text-xs text-slate-400">{formatDate(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{n.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 9: MENSAGENS                                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "messages" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mensagens com o Cliente</CardTitle>
            <Link href={`/messages`}>
              <Button size="sm" variant="outline">
                Abrir na Central de Mensagens
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Usa a secção de Mensagens da barra lateral para conversar em tempo real com este cliente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: FICHA DA CONSULTA (EDITOR DE CONSULTA)                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedConsultation && (
        <Modal
          isOpen={!!selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          title="Ficha da Consulta Clínica"
          description={`Consulta agendada para ${formatDateTime(selectedConsultation.scheduledAt)} (${selectedConsultation.durationMinutes} min)`}
        >
          <form onSubmit={handleUpdateConsultation} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estado da Consulta
              </label>
              <select
                value={editConsultationStatus}
                onChange={(e) => setEditConsultationStatus(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="SCHEDULED">Agendada (Pendente)</option>
                <option value="COMPLETED">Realizada (Concluída com Sucesso)</option>
                <option value="CANCELLED">Cancelada</option>
                <option value="NO_SHOW">Não Compareceu (Falta)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notas / Motivo / Queixas do Paciente
              </label>
              <textarea
                value={editConsultationNotes}
                onChange={(e) => setEditConsultationNotes(e.target.value)}
                rows={3}
                placeholder="Ex: Queixas digestivas, alterações de rotina, novos hábitos..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações Clínicas & Conduta Nutricional
              </label>
              <textarea
                value={editConsultationObs}
                onChange={(e) => setEditConsultationObs(e.target.value)}
                rows={4}
                placeholder="Ex: Ajustada ingestão hídrica para 2.5L, aumentado aporte proteico ao pequeno-almoço..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConsultation(null)}
              >
                Fechar
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={savingConsultation}>
                {savingConsultation ? "A guardar..." : "Guardar Ficha da Consulta"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: NOVA MEDIÇÃO                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={measurementModalOpen}
        onClose={() => setMeasurementModalOpen(false)}
        title="Registar Nova Medição"
        description="Regista peso, altura, pregas ou perímetros corporais"
      >
        <form onSubmit={handleCreateMeasurement} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de Medição
            </label>
            <select
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {measurementTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Valor Medido
            </label>
            <Input
              type="number"
              step="0.1"
              value={measurementValue}
              onChange={(e) => setMeasurementValue(e.target.value)}
              placeholder="Ex: 68.5"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações
            </label>
            <Input
              value={measurementNotes}
              onChange={(e) => setMeasurementNotes(e.target.value)}
              placeholder="Ex: Medido em jejum"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMeasurementModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={measurementLoading}>
              {measurementLoading ? "A guardar..." : "Guardar Medição"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: NOVA NOTA CONFIDENCIAL                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Adicionar Nota Confidencial"
        description="Nota privada confidencial com proteção médica (o cliente nunca vê)"
      >
        <form onSubmit={handleCreateNote} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título da Nota (Opcional)
            </label>
            <Input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Ex: Histórico clínico, intolerâncias..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Conteúdo da Nota
            </label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              placeholder="Escreve aqui notas clínicas confidenciais..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setNoteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={noteLoading}>
              {noteLoading ? "A guardar..." : "Guardar Nota Privada"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: AGENDAR CONSULTA                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        title="Agendar Consulta Clínica"
        description={`Marcação de consulta com ${client.name}`}
      >
        <form onSubmit={handleCreateConsultation} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Data e Hora
            </label>
            <Input
              type="datetime-local"
              value={consultationDate}
              onChange={(e) => setConsultationDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Duração (Minutos)
            </label>
            <select
              value={consultationDuration}
              onChange={(e) => setConsultationDuration(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="30">30 minutos (Seguimento rápido)</option>
              <option value="45">45 minutos (Consulta padrão)</option>
              <option value="60">60 minutos (Primeira Consulta / Avaliação completa)</option>
              <option value="90">90 minutos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas ou Objetivo da Consulta
            </label>
            <Input
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              placeholder="Ex: Consulta de avaliação mensal de medidas"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConsultationModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={consultationLoading}>
              {consultationLoading ? "A agendar..." : "Agendar Consulta"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
