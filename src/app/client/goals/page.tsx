import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, Droplets, Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ClientGoalsPage() {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") {
    redirect("/login");
  }

  const client = await prisma.clientProfile.findUnique({
    where: { userId: session.userId },
    include: {
      goals: {
        include: {
          progress: {
            orderBy: { recordedAt: "desc" },
            take: 3,
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const goals = client?.goals || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Os Meus Objetivos
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Metas definidas em conjunto com o teu nutricionista para o teu percurso.
        </p>
      </div>

      {goals.length === 0 ? (
        <Card className="p-8 text-center bg-white">
          <p className="text-sm text-slate-500">
            Ainda não tens objetivos definidos. Fala com o teu nutricionista na próxima consulta.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {goal.targetValue
                            ? `Alvo: ${goal.targetValue} ${goal.unit || ""}`
                            : "Hábito comportamental"}
                        </span>
                        <span className="text-slate-400">
                          Frequência: {goal.frequency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="success">{goal.status}</Badge>
                </div>

                {goal.progress && goal.progress.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Últimos Registos:
                    </span>
                    {goal.progress.map((p) => (
                      <div
                        key={p.id}
                        className="text-xs text-slate-600 flex items-center justify-between"
                      >
                        <span>{p.note || `${p.value} registado`}</span>
                        <span className="text-slate-400">
                          {formatDate(p.recordedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
