"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Apple, Plus, Search, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

interface FoodsViewProps {
  initialFoods: any[];
}

export function FoodsView({ initialFoods }: FoodsViewProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");

  // Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("Geral");
  const [calories, setCalories] = React.useState("");
  const [protein, setProtein] = React.useState("");
  const [carbs, setCarbs] = React.useState("");
  const [fat, setFat] = React.useState("");
  const [fiber, setFiber] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const categories = Array.from(
    new Set(initialFoods.map((f) => f.category).filter(Boolean))
  );

  const filteredFoods = initialFoods.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.category && f.category.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === "ALL" || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);

    try {
      const res = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          caloriesPer100g: calories,
          proteinPer100g: protein,
          carbsPer100g: carbs,
          fatPer100g: fat,
          fiberPer100g: fiber,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setName("");
        setCalories("");
        setProtein("");
        setCarbs("");
        setFat("");
        setFiber("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tabela da Composição de Alimentos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Base de dados global e alimentos criados por ti (por 100g)
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="gap-1.5"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Novo Alimento Personalizado</span>
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar alimento por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-2 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
              selectedCategory === "ALL"
                ? "bg-emerald-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Todas ({initialFoods.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Foods Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-6">Alimento</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-right">Energia (kcal)</th>
                <th className="py-3 px-4 text-right">Proteína (g)</th>
                <th className="py-3 px-4 text-right">Hidratos (g)</th>
                <th className="py-3 px-4 text-right">Lípidos (g)</th>
                <th className="py-3 px-4 text-right">Fibra (g)</th>
                <th className="py-3 px-6 text-center">Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFoods.map((food) => (
                <tr key={food.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">
                    {food.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {food.category || "Geral"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {food.caloriesPer100g !== null ? food.caloriesPer100g : "-"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {food.proteinPer100g !== null ? `${food.proteinPer100g}g` : "-"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {food.carbsPer100g !== null ? `${food.carbsPer100g}g` : "-"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {food.fatPer100g !== null ? `${food.fatPer100g}g` : "-"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    {food.fiberPer100g !== null ? `${food.fiberPer100g}g` : "-"}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    {food.source === "GLOBAL" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                        Global
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Personalizado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Add Custom Food */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Criar Alimento Personalizado"
        description="Adiciona um alimento exclusivo para utilizares nos teus planos (valores por 100g)"
      >
        <form onSubmit={handleCreateFood} className="space-y-4">
          <Input
            label="Nome do Alimento *"
            placeholder="ex: Pão de Fermentação Lenta de Espelta"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Categoria"
              placeholder="ex: Padaria, Laticínios..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Input
              label="Calorias (kcal)"
              type="number"
              step="0.1"
              placeholder="ex: 245"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Input
              label="Proteína (g)"
              type="number"
              step="0.1"
              placeholder="9.5"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
            <Input
              label="Hidratos (g)"
              type="number"
              step="0.1"
              placeholder="48.0"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
            />
            <Input
              label="Lípidos (g)"
              type="number"
              step="0.1"
              placeholder="2.0"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
            />
            <Input
              label="Fibra (g)"
              type="number"
              step="0.1"
              placeholder="5.2"
              value={fiber}
              onChange={(e) => setFiber(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Guardar Alimento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
