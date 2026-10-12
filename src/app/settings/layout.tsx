import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NutritionistSidebar } from "@/components/layout/nutritionist-sidebar";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "NUTRITIONIST" && session.role !== "ADMIN") redirect("/client");

  const profile = await prisma.nutritionistProfile.findUnique({
    where: { userId: session.userId },
    include: { subscription: { include: { plan: true } } },
  });

  const userProp = {
    name: profile?.name || session.name,
    email: session.email,
    avatarUrl: profile?.avatarUrl,
    licenseNumber: profile?.licenseNumber,
    subscriptionPlan: profile?.subscription?.plan.name || "Starter",
    isTrial: profile?.subscription?.status === "TRIAL",
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <NutritionistSidebar user={userProp} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
