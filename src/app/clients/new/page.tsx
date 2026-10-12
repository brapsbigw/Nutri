"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Copy, Sparkles, UserPlus } from "lucide-react";
import { NutritionistHeader } from "@/components/layout/nutritionist-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewClientPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Success state with generated invite
  const [createdClient, setCreatedClient] = React.useState<{
    id: string;
    name: string;
    invite: { code: string };
  } | null>(null);

  const [copied, setCopied] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          gender,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar cliente.");
        setLoading(false);
        return;
      }

      setCreatedClient(data.client);
      setLoading(false);
    } catch {
      setError("Erro ao contactar o servidor.");
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!createdClient) return;
    navigator.clipboard.writeText(createdClient.invite.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div>
      <NutritionistHeader
        title="Criar Novo Cliente"
        subtitle="Regista o cliente e gera imediatamente o código de convite único"
        action={
          <Link href="/clients">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar aos Clientes</span>
            </Button>
          </Link>
        }
      />

      <div className="max-w-2xl mx-auto px-8 py-8">
        {createdClient ? (
          <Card className="border-emerald-200 bg-white">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Cliente {createdClient.name} Criado(a) com Sucesso!
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Envia o código abaixo para o cliente ativar a sua conta na aplicação.
                </p>
              </div>

              {/* Invite Code Display Box */}
              <div className="p-4 rounded-xl bg-slate-50 border-2 border-dashed border-emerald-300 max-w-md mx-auto flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Código de Convite Único
                  </span>
                  <span className="text-2xl font-mono font-bold text-emerald-800 tracking-wider">
                    {createdClient.invite.code}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="gap-1.5 shrink-0"
                >
                  <Copy className="h-4 w-4 text-emerald-600" />
                  <span>{copied ? "Copiado!" : "Copiar"}</span>
                </Button>
              </div>

              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                O cliente só precisa de aceder a{" "}
                <span className="font-mono text-slate-700">/register-client</span>,
                introduzir este código e definir a sua palavra-passe. A conta ficará automaticamente ligada a ti.
              </p>

              <div className="flex items-center justify-center gap-3 pt-4">
                <Link href={`/clients/${createdClient.id}`}>
                  <Button variant="primary">
                    Abrir Ficha Clínica do Cliente
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreatedClient(null);
                    setName("");
                    setEmail("");
                    setPhone("");
                    setNotes("");
                  }}
                >
                  Adicionar Outro
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
              <p className="text-xs text-slate-500">
                Preenche os dados essenciais para abrir a ficha clínica
              </p>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700 flex items-start gap-2">
                  <span className="shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nome Completo do Cliente *"
                  placeholder="ex: Joana Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Endereço de E-mail"
                    type="email"
                    placeholder="joana@exemplo.pt"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    label="Contacto Telefónico"
                    placeholder="+351 9..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Género / Sexo
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">Selecionar...</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Notas Iniciais / Motivo de Consulta
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Objetivos principais, histórico ou considerações iniciais..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <Link href="/clients">
                    <Button variant="ghost" type="button">
                      Cancelar
                    </Button>
                  </Link>
                  <Button type="submit" variant="primary" isLoading={loading}>
                    Guardar e Gerar Convite
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
