import jsPDF from 'jspdf';

interface MealItem {
  food: {
    name: string;
    caloriesPer100g: number | null;
    proteinPer100g: number | null;
    carbsPer100g: number | null;
    fatPer100g: number | null;
  } | null;
  quantity: number;
  unit: string;
  notes?: string | null;
}

interface Meal {
  name: string;
  scheduledTime?: string | null;
  instructions?: string | null;
  items: MealItem[];
}

interface PlanDay {
  dayNumber: number;
  label?: string | null;
  notes?: string | null;
  meals: Meal[];
}

interface NutritionPlan {
  title: string;
  description?: string | null;
  nutritionist: {
    name: string;
    licenseNumber?: string | null;
    phone?: string | null;
    clinic?: {
      name: string;
      logoUrl?: string | null;
      address?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
  };
  client: {
    name: string;
  };
  days: PlanDay[];
}

export async function generatePlanPDF(plan: NutritionPlan): Promise<Buffer> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  let yPosition = margin;

  // Cores
  const primaryColor: [number, number, number] = [16, 185, 129]; // emerald-500
  const textColor: [number, number, number] = [51, 65, 85]; // slate-600
  const lightGray: [number, number, number] = [241, 245, 249]; // slate-100

  // Adicionar logo da clínica se existir
  if (plan.nutritionist.clinic?.logoUrl) {
    try {
      doc.addImage(plan.nutritionist.clinic.logoUrl, 'PNG', margin, yPosition, 40, 20);
      yPosition += 25;
    } catch (error) {
      console.error('Erro ao adicionar logo:', error);
    }
  }

  // Cabeçalho
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Plano Alimentar', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(16);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(plan.title, margin, yPosition);
  yPosition += 8;

  if (plan.description) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const descriptionLines = doc.splitTextToSize(plan.description, pageWidth - 2 * margin);
    doc.text(descriptionLines, margin, yPosition);
    yPosition += descriptionLines.length * 5 + 5;
  }

  // Informação do cliente
  yPosition += 5;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'F');
  yPosition += 8;

  doc.setFontSize(11);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Cliente: ${plan.client.name}`, margin + 5, yPosition);
  yPosition += 6;
  doc.text(`Nutricionista: ${plan.nutritionist.name}`, margin + 5, yPosition);
  yPosition += 6;
  if (plan.nutritionist.licenseNumber) {
    doc.text(`Cédula: ${plan.nutritionist.licenseNumber}`, margin + 5, yPosition);
  }
  yPosition += 10;

  // Informação da clínica
  if (plan.nutritionist.clinic) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(plan.nutritionist.clinic.name, margin, yPosition);
    yPosition += 4;
    if (plan.nutritionist.clinic.address) {
      doc.text(plan.nutritionist.clinic.address, margin, yPosition);
      yPosition += 4;
    }
    if (plan.nutritionist.clinic.phone) {
      doc.text(`Tel: ${plan.nutritionist.clinic.phone}`, margin, yPosition);
      yPosition += 4;
    }
    if (plan.nutritionist.clinic.email) {
      doc.text(`Email: ${plan.nutritionist.clinic.email}`, margin, yPosition);
    }
    yPosition += 8;
  }

  // Linha separadora
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Planos para cada dia
  for (const day of plan.days) {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    // Título do dia
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const dayTitle = day.label || `Dia ${day.dayNumber}`;
    doc.text(dayTitle, margin, yPosition);
    yPosition += 7;

    if (day.notes) {
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(day.notes, margin, yPosition);
      yPosition += 5;
    }

    // Refeições
    for (const meal of day.meals) {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }

      // Nome da refeição
      doc.setFontSize(11);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      const mealTitle = meal.scheduledTime
        ? `${meal.name} (${meal.scheduledTime})`
        : meal.name;
      doc.text(mealTitle, margin + 5, yPosition);
      yPosition += 5;

      // Instruções
      if (meal.instructions) {
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        const instructionLines = doc.splitTextToSize(
          `Instruções: ${meal.instructions}`,
          pageWidth - 2 * margin - 10
        );
        doc.text(instructionLines, margin + 10, yPosition);
        yPosition += instructionLines.length * 4 + 3;
      }

      // Itens da refeição
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      for (const item of meal.items) {
        if (!item.food) continue;
        const itemText = `• ${item.food.name} - ${item.quantity}${item.unit}`;
        doc.text(itemText, margin + 10, yPosition);
        yPosition += 4;

        if (item.notes) {
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`  Nota: ${item.notes}`, margin + 15, yPosition);
          yPosition += 4;
          doc.setFontSize(9);
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        }
      }

      yPosition += 5;
    }

    yPosition += 8;
  }

  // Rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 160, 175);
    doc.text(
      `Gerado automaticamente em ${new Date().toLocaleDateString('pt-PT')}`,
      margin,
      pageHeight - 10
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin - 30,
      pageHeight - 10
    );
  }

  // Retornar buffer
  return Buffer.from(doc.output('arraybuffer'));
}
