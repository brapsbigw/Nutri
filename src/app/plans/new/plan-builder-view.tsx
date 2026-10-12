"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Clock, Check, UtensilsCrossed, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlanBuilderViewProps {
  clients: any[];
  foods: any[];
}

export function PlanBuilderView({ clients, foods }: PlanBuilderViewProps) {
  const router = useRouter();

  const [selectedClientId, setSelectedClientId] = React.useState(clients[0]?.id || "");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<"DRAFT" | "PUBLISHED">("PUBLISHED");

  const [days, setDays] = React.useState([
    {
      label: "Dia Geral (Segunda a Sexta)",
      notes: "Plano padrão para a semana",
      meals: [
        {
          name: "Pequeno-almoço 🍳",
          scheduledTime: "08:00",
          instructions: "Preparar na véspera se necessário",
          items: [
            { foodId: foods[0]?.id || "", quantity: "45", unit: "g" },
            { foodId: foods[2]?.id || "", quantity: "150", unit: "g" },
          ],
        },
        {
          name: "Almoço 🥗",
          scheduledTime: "13:00",
          instructions: "Grelhar com ervas aromáticas",
          items: [
            { foodId: foods[3]?.id || "", quantity: "140", unit: "g" },
            { foodId: foods[4]?.id || "", quantity: "120", unit: "g" },
            { foodId: foods[5]?.id || "", quantity: "150", unit: "g" },
          ],
        },
      ],
    },
  ]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Add Day
  const handleAddDay = () => {
    setDays([
      ...days,
      {
        label: `Dia ${days.length + 1}`,
        notes: "",
        meals: [
          {
            name: "Pequeno-almoço 🍳",
            scheduledTime: "08:00",
            instructions: "",
            items: [{ foodId: foods[0]?.id || "", quantity: "50", unit: "g" }],
          },
        ],
      },
    ]);
  };

  // Add Meal to Day
  const handleAddMeal = (dayIndex: number) => {
    const updated = [...days];
    updated[dayIndex].meals.push({
      name: "Nova Refeição 🍽️",
      scheduledTime: "16:00",
      instructions: "",
      items: [{ foodId: foods[0]?.id || "", quantity: "100", unit: "g" }],
    });
    setDays(updated);
  };

  // Add Item to Meal
  const handleAddItem = (dayIndex: number, mealIndex: number) => {
    const updated = [...days];
    updated[dayIndex].meals[mealIndex].items.push({
      foodId: foods[0]?.id || "",
      quantity: "100",
      unit: "g",
    });
    setDays(updated);
  };

  // Remove Item
  const handleRemoveItem = (dayIndex: number, mealIndex: number, itemIndex: number) => {
    const updated = [...days];
    updated[dayIndex].meals[mealIndex].items.splice(itemIndex, 1);
    setDays(updated);
  };

  // Submit Plan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !title) {
      setError("Seleciona o cliente e define o título do plano.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          title,
          description,
          status,
          days,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao guardar o plano.");
        setLoading(false);
        return;
      }

      router.push(`/clients/${selectedClientId}`);
      router.refresh();
    } catch {
      setError("Erro ao contactar o servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Construtor de Plano Alimentar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescrição nutricional estruturada por dias, refeições e gramagens
          </p>
        </div>

        <Link href="/plans">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar aos Planos</span>
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700 flex items-start gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informação Geral do Plano</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Cliente Associado *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.email ? `(${c.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Estado do Plano
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="PUBLISHED">Publicado (Visível na app do cliente)</option>
                  <option value="DRAFT">Rascunho (Apenas visível por ti)</option>
                </select>
              </div>
            </div>

            <Input
              label="Título do Plano *"
              placeholder="ex: Plano de Equilíbrio Metabólico e Saciedade"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Indicações Gerais para o Cliente
              </label>
              <textarea
                rows={2}
                placeholder="Orientações globais, hidratação recomendada, princípios chave..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Days & Meals Structure */}
        {days.map((day, dIdx) => (
          <Card key={dIdx} className="border-emerald-100 shadow-2xs">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 py-3.5 px-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-emerald-950">
                  Dia {dIdx + 1}:
                </span>
                <input
                  type="text"
                  value={day.label}
                  onChange={(e) => {
                    const updated = [...days];
                    updated[dIdx].label = e.target.value;
                    setDays(updated);
                  }}
                  className="h-8 px-2 rounded-md border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs gap-1"
                onClick={() => handleAddMeal(dIdx)}
              >
                <Plus className="h-3.5 w-3.5 text-emerald-600" />
                <span>Adicionar Refeição</span>
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {day.meals.map((meal, mIdx) => (
                <div
                  key={mIdx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={meal.name}
                        onChange={(e) => {
                          const updated = [...days];
                          updated[dIdx].meals[mIdx].name = e.target.value;
                          setDays(updated);
                        }}
                        className="h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs font-bold text-slate-900 flex-1 max-w-xs focus:outline-none focus:border-emerald-500"
                      />
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        <input
                          type="text"
                          value={meal.scheduledTime || ""}
                          placeholder="08:00"
                          onChange={(e) => {
                            const updated = [...days];
                            updated[dIdx].meals[mIdx].scheduledTime = e.target.value;
                            setDays(updated);
                          }}
                          className="h-8 w-16 px-1.5 rounded-md border border-slate-300 bg-white text-xs font-mono text-center focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => handleAddItem(dIdx, mIdx)}
                    >
                      <Plus className="h-3 w-3 text-emerald-600" />
                      <span>+ Alimento</span>
                    </Button>
                  </div>

                  {/* Meal Items List */}
                  <div className="space-y-2 pt-1">
                    {meal.items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 text-xs"
                      >
                        <select
                          value={item.foodId}
                          onChange={(e) => {
                            const updated = [...days];
                            updated[dIdx].meals[mIdx].items[iIdx].foodId = e.target.value;
                            setDays(updated);
                          }}
                          className="flex-1 h-8 rounded border border-slate-300 bg-white px-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                        >
                          {foods.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name} ({f.category || "Geral"})
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          step="1"
                          placeholder="Qtd"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...days];
                            updated[dIdx].meals[mIdx].items[iIdx].quantity = e.target.value;
                            setDays(updated);
                          }}
                          className="w-20 h-8 px-2 rounded border border-slate-300 bg-white text-xs text-center font-bold focus:outline-none focus:border-emerald-500"
                        />

                        <input
                          type="text"
                          placeholder="g, un, ml"
                          value={item.unit}
                          onChange={(e) => {
                            const updated = [...days];
                            updated[dIdx].meals[mIdx].items[iIdx].unit = e.target.value;
                            setDays(updated);
                          }}
                          className="w-16 h-8 px-1.5 rounded border border-slate-300 bg-white text-xs text-center text-slate-600 focus:outline-none focus:border-emerald-500"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(dIdx, mIdx, iIdx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Cooking / Preparation instructions */}
                  <input
                    type="text"
                    placeholder="Instruções de preparação ou notas desta refeição..."
                    value={meal.instructions || ""}
                    onChange={(e) => {
                      const updated = [...days];
                      updated[dIdx].meals[mIdx].instructions = e.target.value;
                      setDays(updated);
                    }}
                    className="w-full h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 italic"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddDay}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Outro Dia</span>
          </Button>

          <div className="flex items-center gap-3">
            <Link href="/plans">
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={loading}>
              Guardar e Aplicar Plano
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
