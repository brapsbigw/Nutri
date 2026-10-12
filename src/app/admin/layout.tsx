import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Shield, LogOut, ArrowLeft, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Top Header */}
      <header className="bg-slate-900 text-white px-8 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">
                Platform Admin Console
              </span>
              <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Superuser
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Nutritionist Management SaaS • Gestão Global
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs gap-1.5"
            >
              <Leaf className="h-3.5 w-3.5 text-emerald-400" />
              <span>Ver Portal Nutricionista</span>
            </Button>
          </Link>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair</span>
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8">{children}</main>
    </div>
  );
}
