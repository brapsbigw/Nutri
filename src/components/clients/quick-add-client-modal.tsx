"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle2, Copy, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QuickAddClientModal({
  buttonLabel = "Novo Cliente",
  buttonVariant = "primary",
  size = "sm",
  className,
  icon,
}: {
  buttonLabel?: string;
  buttonVariant?: "primary" | "outline" | "secondary";
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [createdClient, setCreatedClient] = React.useState<{
    id: string;
    name: string;
    invite: { code: string };
  } | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleOpen = () => {
    setName("");
    setEmail("");
    setPhone("");
    setGender("");
    setNotes("");
    setError(null);
    setCreatedClient(null);
    setCopied(false);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          gender: gender || undefined,
          notes: notes.trim() || undefined,
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
      router.refresh();
    } catch {
      setError("Erro ao comunicar com o servidor.");
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (createdClient?.invite?.code) {
      navigator.clipboard.writeText(createdClient.invite.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        size={size}
        className={`gap-1.5 cursor-pointer ${className || ""}`}
        onClick={handleOpen}
      >
        {icon || <Plus className="h-4 w-4" />}
        <span>{buttonLabel}</span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={createdClient ? "Cliente Criado com Sucesso!" : "Adicionar Novo Cliente"}
        description={
          createdClient
            ? "O código de convite para o cliente aceder à aplicação foi gerado."
            : "Preenche os dados para criar a ficha clínica e gerar o convite."
        }
      >
        {createdClient ? (
          <div className="space-y-5 text-center py-2">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div>
              <p className="text-base font-bold text-slate-900">{createdClient.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Envia este código para o cliente ativar a sua conta na aplicação:
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border-2 border-dashed border-emerald-300 rounded-xl max-w-xs mx-auto flex items-center justify-between">
              <span className="font-mono font-bold text-lg text-emerald-800 tracking-wider">
                {createdClient.invite.code}
              </span>
              <Button size="sm" variant="outline" onClick={handleCopy} className="text-xs gap-1">
                <Copy className="h-3.5 w-3.5" />
                <span>{copied ? "Copiado!" : "Copiar"}</span>
              </Button>
            </div>

            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              O cliente acede a <strong>/register-client</strong>, insere este código e define a palavra-passe. Ficará ligado a ti automaticamente.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/clients/${createdClient.id}`);
                }}
              >
                Abrir Ficha Clínica
              </Button>
              <Button variant="outline" onClick={handleOpen}>
                Criar Outro Cliente
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <Input
              label="Nome Completo do Cliente *"
              placeholder="ex: Joana Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="E-mail"
                type="email"
                placeholder="joana@exemplo.pt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Telemóvel"
                placeholder="+351 9..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Género
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Selecionar (opcional)...</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Objetivo Principal / Notas Iniciais
              </label>
              <textarea
                rows={2}
                placeholder="ex: Emagrecimento, reeducação alimentar..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Criar e Gerar Convite
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
