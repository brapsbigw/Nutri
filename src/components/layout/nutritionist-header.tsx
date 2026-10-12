"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Plus, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NutritionistHeaderProps {
  title?: string;
  subtitle?: string;
  userRole?: string;
  action?: React.ReactNode;
}

export function NutritionistHeader({
  title,
  subtitle,
  userRole,
  action,
}: NutritionistHeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        {title && <h2 className="text-lg font-bold text-slate-900">{title}</h2>}
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {userRole === "ADMIN" && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Console</span>
          </Link>
        )}

        {action ? (
          action
        ) : (
          <Link href="/clients/new">
            <Button size="sm" variant="primary" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Novo Cliente</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
