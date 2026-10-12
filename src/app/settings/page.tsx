import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NutritionistHeader } from "@/components/layout/nutritionist-header";
import { ProfileSettingsView } from "./profile-settings-view";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.nutritionistProfile.findUnique({
    where: { userId: session.userId },
    include: { clinic: true },
  });

  return (
    <div>
      <NutritionistHeader
        title="Definições"
        subtitle="Configuração da conta e perfil profissional"
        userRole={session.role}
      />
      <ProfileSettingsView profile={profile} userEmail={session.email} />
    </div>
  );
}
