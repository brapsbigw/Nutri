"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sun,
  UtensilsCrossed,
  Target,
  TrendingUp,
  MessageSquare,
  LogOut,
  Leaf,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientNavProps {
  clientName: string;
  nutritionistName: string;
}

export function ClientNav({ clientName, nutritionistName }: ClientNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Hoje", href: "/client", icon: Sun },
    { label: "Plano", href: "/client/plan", icon: UtensilsCrossed },
    { label: "Objetivos", href: "/client/goals", icon: Target },
    { label: "Evolução", href: "/client/progress", icon: TrendingUp },
    { label: "Mensagens", href: "/client/messages", icon: MessageSquare },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <Leaf className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">{clientName}</p>
            <p className="text-[11px] text-slate-500">Acompanhamento: {nutritionistName}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/client" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-emerald-600" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          title="Terminar Sessão"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* Mobile-first Bottom Sticky Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/client" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[11px] font-medium transition-colors",
                isActive
                  ? "text-emerald-700 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 mb-0.5",
                  isActive ? "text-emerald-600" : "text-slate-400"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
