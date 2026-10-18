"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, KeyRound, ShieldAlert, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterNutritionistPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [trialKey, setTrialKey] = React.useState("");
  const [licenseNumber, setLicenseNumber] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-nutritionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          trialKey,
          licenseNumber,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível criar a conta.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erro ao contactar o servidor. Tenta novamente.");
      setLoading(false);
    }
  };

  const useDemoKey = () => {
    setTrialKey("TRIAL-PRO-BONO-2026");
    setError(null);
  };

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
          Criar Conta de Nutricionista
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-600">
          Requer chave de ativação ou trial emitida pela plataforma
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

          <div className="mb-5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <KeyRound className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-semibold">Política de Trial Controlado:</p>
              <p className="mt-0.5 text-slate-600">
                O acesso profissional é concedido exclusivamente através de chaves geradas pelo administrador da plataforma.
              </p>
              <button
                type="button"
                onClick={useDemoKey}
                className="mt-1.5 font-semibold text-emerald-700 underline hover:text-emerald-800 cursor-pointer"
              >
                Usar chave de demonstração ativa: TRIAL-PRO-BONO-2026
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Chave de Trial / Acesso *"
              placeholder="ex: TRIAL-XXXX-XXXX"
              value={trialKey}
              onChange={(e) => setTrialKey(e.target.value)}
              required
            />

            <Input
              label="Nome Profissional Completo *"
              placeholder="ex: Dra. Margarida Lopes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Endereço de E-mail Profissional *"
              type="email"
              placeholder="margarida@clinica.pt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Palavra-passe (mínimo 8 carateres) *"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              trailingElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-1"
                  aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cédula Profissional"
                placeholder="C.P. 1234N"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
              <Input
                label="Telemóvel"
                placeholder="+351 9..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={loading}
            >
              Ativar e Iniciar Espaço Clínico
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>Já tens uma conta ativa? </span>
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
