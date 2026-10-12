"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User, CheckCircle2, Building, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileSettingsViewProps {
  profile: any;
  userEmail: string;
}

export function ProfileSettingsView({
  profile,
  userEmail,
}: ProfileSettingsViewProps) {
  const router = useRouter();
  const [name, setName] = React.useState(profile?.name || "");
  const [bio, setBio] = React.useState(profile?.bio || "");
  const [phone, setPhone] = React.useState(profile?.phone || "");
  const [licenseNumber, setLicenseNumber] = React.useState(
    profile?.licenseNumber || ""
  );
  const [specializations, setSpecializations] = React.useState(
    profile?.specializations || ""
  );

  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/nutritionist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          phone,
          licenseNumber,
          specializations,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Definições de Perfil Profissional
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Os teus dados clínicos e de identificação apresentados aos clientes
        </p>
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Perfil atualizado com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informação Pessoal & Clínica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Profissional *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Cédula Profissional"
                placeholder="C.P. 1234N"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Endereço de E-mail (Conta)"
                value={userEmail}
                disabled
                helperText="O e-mail da conta não pode ser alterado por aqui."
              />
              <Input
                label="Contacto Telefónico"
                placeholder="+351 9..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Input
              label="Áreas de Especialização"
              placeholder="ex: Emagrecimento, Desporto, Saúde Digestiva"
              value={specializations}
              onChange={(e) => setSpecializations(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Biografia e Apresentação aos Clientes
              </label>
              <textarea
                rows={3}
                placeholder="Breve descrição da tua abordagem nutricional..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" isLoading={loading}>
                Guardar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clinic Association Card */}
        {profile?.clinic && (
          <Card className="border-slate-200">
            <CardHeader className="py-3 px-5 bg-slate-50/50">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building className="h-4 w-4 text-emerald-600" />
                <span>Clínica Associada</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-sm text-slate-900">
                {profile.clinic.name}
              </p>
              <p className="text-slate-500">{profile.clinic.address}</p>
              <p className="text-slate-500">{profile.clinic.phone}</p>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
