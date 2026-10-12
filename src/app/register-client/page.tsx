"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, UserPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterClientPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode,
          name,
          email,
          password,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível associar o teu convite.");
        setLoading(false);
        return;
      }

      router.push("/client");
      router.refresh();
    } catch {
      setError("Erro ao contactar o servidor. Tenta novamente.");
      setLoading(false);
    }
  };

  const useDemoInvite = () => {
    setInviteCode("INV-TIAGO-BEA26");
    setName("Beatriz Santos");
    setEmail("beatriz.santos@exemplo.local");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Leaf className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Nutritionist<span className="text-emerald-600 font-semibold">.Management</span>
          </span>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Ativar Acesso de Cliente
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-600">
          Introduz o código de convite enviado pelo teu nutricionista
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700 flex items-start gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5 p-3 rounded-xl bg-sky-50/60 border border-sky-200 text-xs text-sky-800 flex items-start gap-2">
            <UserPlus className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
            <div>
              <p className="font-semibold">Ligação Segura ao Nutricionista:</p>
              <p className="mt-0.5 text-slate-600">
                Após ativares a conta com o código, ela ficará permanentemente ligada ao teu nutricionista e nunca mais terás de introduzir o código.
              </p>
              <button
                type="button"
                onClick={useDemoInvite}
                className="mt-1.5 font-semibold text-sky-700 underline hover:text-sky-800 cursor-pointer"
              >
                Testar com convite pendente da demo: INV-TIAGO-BEA26
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Código de Convite *"
              placeholder="ex: INV-XXXX-XXXX"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
            />

            <Input
              label="O teu Nome Completo"
              placeholder="ex: Beatriz Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="O teu E-mail *"
              type="email"
              placeholder="beatriz@exemplo.pt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Palavra-passe (mínimo 8 carateres) *"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Telemóvel (opcional)"
              placeholder="+351 9..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={loading}
            >
              Ativar e Aceder ao Meu Plano
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>Já ativaste a tua conta? </span>
            <Link
              href="/login"
              className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
            >
              Iniciar sessão
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
