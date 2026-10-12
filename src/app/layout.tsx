import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nutritionist Management — Acompanhar, não controlar",
  description:
    "Plataforma profissional para nutricionistas e clientes focada em adesão real, acompanhamento contínuo e planos nutricionais estruturados.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
