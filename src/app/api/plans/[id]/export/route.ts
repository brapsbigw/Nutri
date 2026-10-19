import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generatePlanPDF } from '@/lib/pdf-generator';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id: planId } = await params;

    // Buscar o plano completo com todos os dados
    const plan = await prisma.nutritionPlan.findUnique({
      where: { id: planId },
      include: {
        nutritionist: {
          include: { clinic: true },
        },
        client: true,
        days: {
          include: {
            meals: {
              include: {
                items: {
                  include: { food: true },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
    }

    // Verificar se o nutricionista tem permissão
    if (plan.nutritionist.userId !== session.userId) {
      return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });
    }

    // Gerar PDF
    const pdfBuffer = await generatePlanPDF(plan);

    // Retornar o PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="plano-${plan.client.name.replace(/\s+/g, '-')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF.' },
      { status: 500 }
    );
  }
}
