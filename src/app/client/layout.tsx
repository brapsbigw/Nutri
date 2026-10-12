import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ClientNav } from "@/components/layout/client-nav";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "CLIENT") {
    redirect("/dashboard");
  }

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: session.userId },
    include: {
      nutritionist: true,
    },
  });

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ClientNav
        clientName={profile.name}
        nutritionistName={profile.nutritionist.name}
      />
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 pb-24 md:pb-12">
        {children}
      </main>
    </div>
  );
}
