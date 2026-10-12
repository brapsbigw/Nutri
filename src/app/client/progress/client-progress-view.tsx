"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Plus, Activity, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface ClientProgressViewProps {
  client: any;
  measurements: any[];
  weightTypeId: string;
}

export function ClientProgressView({
  client,
  measurements,
  weightTypeId,
}: ClientProgressViewProps) {
  const router = useRouter();
  const [newWeight, setNewWeight] = React.useState("");
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || !weightTypeId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/clients/${client.id}/measurements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          measurementTypeId: weightTypeId,
          value: newWeight,
          unit: "kg",
          notes: note || "Registo auto-reportado pelo cliente",
        }),
      });

      if (res.ok) {
        setNewWeight("");
        setNote("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  // Group measurements by type
  const weights = measurements.filter((m) =>
    m.measurementType.name.toLowerCase().includes("peso")
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          A Minha Evolução
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Acompanhamento das tuas medições e evolução de peso ao longo do tempo.
        </p>
      </div>

      {/* Quick Self-Record Weight Card */}
      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardHeader className="py-3.5 px-5">
          <CardTitle className="text-sm text-emerald-950 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <span>Registar o meu peso hoje</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {success ? (
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Peso registado com sucesso na tua ficha!</span>
            </div>
          ) : (
            <form
              onSubmit={handleLogWeight}
              className="flex flex-col sm:flex-row items-end gap-3"
            >
              <div className="w-full sm:w-48">
                <Input
                  label="Peso (kg)"
                  type="number"
                  step="0.1"
                  required
                  placeholder="ex: 67.2"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                />
              </div>
              <div className="w-full sm:flex-1">
                <Input
                  label="Nota (opcional)"
                  placeholder="ex: em jejum, de manhã"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto"
                isLoading={loading}
              >
                Registar
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Measurements History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Medições</CardTitle>
          <p className="text-xs text-slate-500">
            Valores registados em consulta e auto-reportados
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Parâmetro</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Origem</th>
                  <th className="py-3 px-4">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {measurements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {formatDate(m.measuredAt)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {m.measurementType.name}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-bold text-sm">
                      {m.value} {m.unit}
                    </td>
                    <td className="py-3 px-4">
                      {m.recordedByRole === "NUTRITIONIST" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          🩺 Nutricionista (Em Consulta)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          📱 Auto-reportado em Casa
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{m.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
