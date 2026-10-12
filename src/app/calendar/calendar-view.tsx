"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { formatDateTime } from "@/lib/utils";

interface CalendarViewProps {
  consultations: any[];
  clients: any[];
}

export function CalendarView({ consultations, clients }: CalendarViewProps) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<"ALL" | "SCHEDULED" | "COMPLETED">("ALL");

  // Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [clientId, setClientId] = React.useState(clients[0]?.id || "");
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [durationMinutes, setDurationMinutes] = React.useState("60");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const filtered = consultations.filter((c) => {
    if (filter === "ALL") return true;
    return c.status === filter;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !scheduledAt) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/clients/${clientId}/consultations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt,
          durationMinutes,
          notes,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setScheduledAt("");
        setNotes("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (consultationId: string, status: string) => {
    await fetch(`/api/consultations/${consultationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Agenda e Calendário Clínico
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão de consultas presenciais e online agendadas com os teus clientes
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="gap-1.5"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Agendar Nova Consulta</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            filter === "ALL"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Todas ({consultations.length})
        </button>
        <button
          onClick={() => setFilter("SCHEDULED")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            filter === "SCHEDULED"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Agendadas (
          {consultations.filter((c) => c.status === "SCHEDULED").length})
        </button>
        <button
          onClick={() => setFilter("COMPLETED")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            filter === "COMPLETED"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Realizadas (
          {consultations.filter((c) => c.status === "COMPLETED").length})
        </button>
      </div>

      {/* Consultations List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-slate-500">
              Não existem consultas para o filtro selecionado.
            </p>
          </Card>
        ) : (
          filtered.map((c) => (
            <Card
              key={c.id}
              className="border-slate-200 bg-white hover:border-emerald-200 transition-colors"
            >
              <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                      c.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-sky-100 text-sky-800"
                    }`}
                  >
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/clients/${c.clientId}`}
                        className="text-base font-bold text-slate-900 hover:text-emerald-700"
                      >
                        {c.client.name}
                      </Link>
                      <Badge
                        variant={
                          c.status === "COMPLETED"
                            ? "success"
                            : c.status === "SCHEDULED"
                            ? "info"
                            : "danger"
                        }
                      >
                        {c.status === "COMPLETED"
                          ? "Realizada"
                          : c.status === "SCHEDULED"
                          ? "Agendada"
                          : "Cancelada"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">
                        {formatDateTime(c.scheduledAt)}
                      </span>
                      <span>•</span>
                      <span>Duração: {c.durationMinutes} min</span>
                    </p>
                    {c.notes && (
                      <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                        {c.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {c.status === "SCHEDULED" && (
                    <Button
                      size="sm"
                      variant="soft"
                      className="text-xs gap-1"
                      onClick={() => handleUpdateStatus(c.id, "COMPLETED")}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Marcar Realizada</span>
                    </Button>
                  )}

                  <Link href={`/clients/${c.clientId}`}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <span>Ficha Clínica</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Add Consultation */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Agendar Consulta"
        description="Seleciona o cliente e a data da sessão clínica"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Cliente *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Data e Hora *"
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Duração (Minutos)
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">60 minutos</option>
              <option value="90">90 minutos</option>
            </select>
          </div>

          <Input
            label="Objetivo / Notas da Sessão"
            placeholder="ex: Avaliação mensal e medidas de composição corporal"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
              Confirmar Agendamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
