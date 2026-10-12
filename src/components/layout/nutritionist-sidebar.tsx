"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  UtensilsCrossed,
  Apple,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

interface NutritionistSidebarProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
    licenseNumber?: string | null;
    subscriptionPlan?: string | null;
    isTrial?: boolean;
  };
}

export function NutritionistSidebar({ user }: NutritionistSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Painel Principal", href: "/dashboard", icon: LayoutDashboard },
    { label: "Clientes", href: "/clients", icon: Users },
    { label: "Calendário", href: "/calendar", icon: Calendar },
    { label: "Planos Alimentares", href: "/plans", icon: UtensilsCrossed },
    { label: "Base de Alimentos", href: "/foods", icon: Apple },
    { label: "Mensagens", href: "/messages", icon: MessageSquare },
    { label: "Subscrição", href: "/settings/subscription", icon: CreditCard },
    { label: "Definições", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">
              Nutritionist<span className="text-emerald-600">.Mgt</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Espaço Clínico Profissional</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-800 font-semibold shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-emerald-700" : "text-slate-400"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile & Logout Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-3">
          <Avatar name={user.name} src={user.avatarUrl} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user.licenseNumber ? user.licenseNumber : user.email}
            </p>
          </div>
        </div>

        {user.isTrial && (
          <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
            <span className="font-semibold">Período de Trial</span>
            <Link
              href="/settings/subscription"
              className="text-amber-900 font-bold underline"
            >
              Ativar
            </Link>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Terminar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
