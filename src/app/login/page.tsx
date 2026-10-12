"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "E-mail ou palavra-passe incorretos.");
        setLoading(false);
        return;
      }

      router.push(data.redirectTo || from);
      router.refresh();
    } catch {
      setError("Erro ao contactar o servidor. Tenta novamente.");
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
      {error && (
        <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700 flex items-start gap-2">
          <span className="shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Endereço de E-mail"
          type="email"
          placeholder="ex: sofia.martins@clinic.local"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <Input
          label="Palavra-passe"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={loading}
        >
          Iniciar Sessão
        </Button>
      </form>

      {/* Demo Credentials Quick Switcher */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>Contas de Demonstração (1-Clique)</span>
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillDemo("sofia.martins@clinic.local", "Nutritionist123!")}
            className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 text-left transition-colors cursor-pointer"
          >
            <div>
              <p className="font-semibold text-emerald-950">Dra. Sofia Martins</p>
              <p className="text-slate-500">Nutricionista (Clínica • Plano Pro)</p>
            </div>
            <span className="text-emerald-700 font-medium">Usar ➔</span>
          </button>

          <button
            type="button"
            onClick={() => fillDemo("ana.pereira@client.local", "ClientPassword123!")}
            className="flex items-center justify-between p-2.5 rounded-lg border border-sky-100 bg-sky-50/40 hover:bg-sky-50 text-left transition-colors cursor-pointer"
          >
            <div>
              <p className="font-semibold text-sky-950">Ana Pereira</p>
              <p className="text-slate-500">Cliente (Plano ativo, diário e consultas)</p>
            </div>
            <span className="text-sky-700 font-medium">Usar ➔</span>
          </button>

          <button
            type="button"
            onClick={() => fillDemo("admin@nutritionist.local", "AdminPassword123!")}
            className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
          >
            <div>
              <p className="font-semibold text-slate-900">Platform Admin</p>
              <p className="text-slate-500">Administrador global da plataforma</p>
            </div>
            <span className="text-slate-600 font-medium">Usar ➔</span>
          </button>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-2 text-center text-xs text-slate-600">
        <Link
          href="/register"
          className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
        >
          É nutricionista? Ativar conta com Chave de Trial
        </Link>
        <Link
          href="/register-client"
          className="text-slate-600 hover:text-slate-900 hover:underline"
        >
          É cliente? Entrar com Código de Convite do Nutricionista
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
          Entrar na plataforma
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-600">
          Acompanhar, não controlar.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <React.Suspense fallback={<div className="bg-white p-8 rounded-2xl text-center text-xs text-slate-500">A carregar...</div>}>
          <LoginForm />
        </React.Suspense>
      </div>
    </div>
  );
}
