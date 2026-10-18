import Link from "next/link";
import { Leaf, Download, Monitor, CheckCircle2, ShieldCheck, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const DOWNLOAD_URL = "https://github.com/brapsbigw/Nutri/releases/latest/download/Nutri.Setup.1.0.0.exe";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/25 to-slate-100 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Nutritionist<span className="text-emerald-600 font-semibold">.Management</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs">
              Abrir no Navegador
            </Button>
          </Link>
          <a href={DOWNLOAD_URL} download>
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              <span>Descarregar .EXE</span>
            </Button>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-12 text-center my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-6">
          <Monitor className="h-3.5 w-3.5" />
          <span>Aplicação Oficial para Computador</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Nutri para <span className="text-emerald-600">Windows</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Acede à tua ficha clínica, planos alimentares, biometria e mensagens diretamente no teu computador, com uma janela dedicada, rápida e sincronizada em tempo real.
        </p>

        {/* CTA Card */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3">
          <a
            href={DOWNLOAD_URL}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-base shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Download className="h-5 w-5" />
            <span>Descarregar para Windows (64-bit)</span>
          </a>
          <p className="text-xs text-slate-500">
            Versão 1.0.0 • Instalador Autónomo .EXE (81.7 MB) • Windows 10 & 11
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Arranque Instantâneo</h3>
            <p className="text-xs text-slate-500 mt-1">
              Abre diretamente do teu Ambiente de Trabalho ou Menu Iniciar sem distrações de abas do browser.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Nuvem em Tempo Real</h3>
            <p className="text-xs text-slate-500 mt-1">
              Ligada à tua base de dados na nuvem: o que registas no computador aparece logo no telemóvel dos clientes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Segurança & Privacidade</h3>
            <p className="text-xs text-slate-500 mt-1">
              Comunicações encriptadas, isolamento de dados clínicos e autenticação JWT profissional.
            </p>
          </div>
        </div>

        {/* Quick Setup Instructions */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Como instalar em qualquer computador:
          </h4>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
              <span>Clica no botão acima para descarregar o ficheiro <strong>Nutri Setup 1.0.0.exe</strong>.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
              <span>Dá dois cliques no ficheiro descarregado para instalar no teu Windows.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
              <span>Abre o ícone criado no teu Ambiente de Trabalho e inicia sessão!</span>
            </li>
          </ol>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <p>© 2026 Nutritionist Management SaaS • Acompanhar, não controlar.</p>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-emerald-700 transition-colors">
            Iniciar Sessão
          </Link>
          <Link href="/register" className="hover:text-emerald-700 transition-colors">
            Ativar Conta
          </Link>
        </div>
      </footer>
    </div>
  );
}
