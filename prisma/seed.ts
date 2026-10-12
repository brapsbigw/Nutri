import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed database for Nutritionist Management SaaS...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.note.deleteMany();
  await prisma.progressPhoto.deleteMany();
  await prisma.mealLog.deleteMany();
  await prisma.measurement.deleteMany();
  await prisma.measurementType.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.goalProgress.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.mealItem.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.planDay.deleteMany();
  await prisma.nutritionPlan.deleteMany();
  await prisma.food.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.trialKey.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.nutritionistProfile.deleteMany();
  await prisma.clinicMember.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Existing records cleaned.");

  // Password hashes
  const adminHash = await bcrypt.hash("AdminPassword123!", 10);
  const nutriHash = await bcrypt.hash("Nutritionist123!", 10);
  const clientHash = await bcrypt.hash("ClientPassword123!", 10);

  // 1. Create Platform Admin
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@nutritionist.local",
      passwordHash: adminHash,
      role: "ADMIN",
      isActive: true,
      emailVerified: new Date(),
    },
  });
  console.log("✅ Admin created:", adminUser.email);

  // 2. Create Subscription Plans
  const starterPlan = await prisma.subscriptionPlan.create({
    data: {
      name: "Starter",
      slug: "starter",
      priceMonthly: 29.0,
      priceYearly: 290.0,
      maxClients: 25,
      maxTeamMembers: 1,
      maxStorageGb: 5,
      features: JSON.stringify([
        "Até 25 clientes ativos",
        "Planos alimentares ilimitados",
        "Acompanhamento de adesão",
        "Medições e evolução",
        "Suporte por email",
      ]),
      isActive: true,
    },
  });

  const proPlan = await prisma.subscriptionPlan.create({
    data: {
      name: "Pro",
      slug: "pro",
      priceMonthly: 49.0,
      priceYearly: 490.0,
      maxClients: 80,
      maxTeamMembers: 2,
      maxStorageGb: 20,
      features: JSON.stringify([
        "Até 80 clientes ativos",
        "Todas as funcionalidades do Starter",
        "Mensagens com clientes",
        "Fotografias de evolução",
        "Alimentos personalizados ilimitados",
        "Suporte prioritário",
      ]),
      isActive: true,
    },
  });

  const businessPlan = await prisma.subscriptionPlan.create({
    data: {
      name: "Business / Clínica",
      slug: "business",
      priceMonthly: 99.0,
      priceYearly: 990.0,
      maxClients: 300,
      maxTeamMembers: 10,
      maxStorageGb: 100,
      features: JSON.stringify([
        "Até 300 clientes",
        "Equipa até 10 nutricionistas",
        "Gestão multi-profissional da clínica",
        "Storage alargado",
        "Apoio dedicado",
      ]),
      isActive: true,
    },
  });
  console.log("✅ Subscription Plans created: Starter, Pro, Business");

  // 3. Create Clinic
  const clinic = await prisma.clinic.create({
    data: {
      name: "Clínica Nutrição & Bem-Estar Lisboa",
      address: "Avenida da Liberdade 180, 4º Esq, 1250-146 Lisboa",
      phone: "+351 213 456 789",
      email: "contacto@clinicabemestar.pt",
      ownerId: adminUser.id,
      isActive: true,
    },
  });
  console.log("✅ Clinic created:", clinic.name);

  // 4. Create Nutritionist 1: Dra. Sofia Martins (in Clinic)
  const nutri1User = await prisma.user.create({
    data: {
      email: "sofia.martins@clinic.local",
      passwordHash: nutriHash,
      role: "NUTRITIONIST",
      isActive: true,
      emailVerified: new Date(),
    },
  });

  const nutri1Profile = await prisma.nutritionistProfile.create({
    data: {
      userId: nutri1User.id,
      clinicId: clinic.id,
      name: "Dra. Sofia Martins",
      bio: "Nutricionista clínica com especialização em emagrecimento saudável e nutrição funcional.",
      phone: "+351 912 345 678",
      licenseNumber: "C.P. 3412N",
      specializations: "Emagrecimento, Nutrição Desportiva, Saúde Digestiva",
      avatarUrl: "https://images.unsplash.com/photo-1594824813689-ffcd9401736b?auto=format&fit=crop&q=80&w=256",
    },
  });

  await prisma.clinicMember.create({
    data: {
      clinicId: clinic.id,
      userId: nutri1User.id,
      role: "MEMBER",
    },
  });

  await prisma.subscription.create({
    data: {
      nutritionistId: nutri1Profile.id,
      planId: proPlan.id,
      status: "ACTIVE",
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("✅ Nutritionist 1 created: Dra. Sofia Martins (Active Pro)");

  // 5. Create Nutritionist 2: Dr. Tiago Silva (Solo / Trial)
  const nutri2User = await prisma.user.create({
    data: {
      email: "tiago.silva@nutri.local",
      passwordHash: nutriHash,
      role: "NUTRITIONIST",
      isActive: true,
      emailVerified: new Date(),
    },
  });

  const nutri2Profile = await prisma.nutritionistProfile.create({
    data: {
      userId: nutri2User.id,
      name: "Dr. Tiago Silva",
      bio: "Nutricionista do desporto e otimização de composição corporal.",
      phone: "+351 923 456 789",
      licenseNumber: "C.P. 5189N",
      specializations: "Hipertrofia, Rendimento Desportivo, Nutrição Vegetariana",
      avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256",
    },
  });

  const trialKeyTiago = await prisma.trialKey.create({
    data: {
      code: "TRIAL-TIAGO-2026",
      createdById: adminUser.id,
      nutritionistId: nutri2User.id,
      durationDays: 30,
      status: "ACTIVE",
      activatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.subscription.create({
    data: {
      nutritionistId: nutri2Profile.id,
      planId: starterPlan.id,
      status: "TRIAL",
      trialKeyId: trialKeyTiago.id,
      currentPeriodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    },
  });

  // Unused Trial Key for Admin testing
  await prisma.trialKey.create({
    data: {
      code: "TRIAL-PRO-BONO-2026",
      createdById: adminUser.id,
      durationDays: 30,
      status: "UNUSED",
    },
  });
  console.log("✅ Nutritionist 2 created: Dr. Tiago Silva (Trial Key Active)");

  // 6. Global Foods Database
  const foodsData = [
    { name: "Flocos de aveia integral", category: "Cereais", cal: 368, prot: 13.5, carb: 58.7, fat: 7.0, fib: 10.0 },
    { name: "Banana da Madeira", category: "Fruta", cal: 89, prot: 1.1, carb: 22.8, fat: 0.3, fib: 2.6 },
    { name: "Iogurte natural magro", category: "Laticínios", cal: 48, prot: 5.2, carb: 4.8, fat: 0.2, fib: 0.0 },
    { name: "Peito de frango grelhado", category: "Carnes", cal: 165, prot: 31.0, carb: 0.0, fat: 3.6, fib: 0.0 },
    { name: "Arroz basmati cozido", category: "Cereais", cal: 121, prot: 3.5, carb: 25.2, fat: 0.4, fib: 0.4 },
    { name: "Brócolos cozidos ao vapor", category: "Legumes", cal: 35, prot: 2.4, carb: 7.2, fat: 0.4, fib: 3.3 },
    { name: "Azeite virgem extra", category: "Gorduras", cal: 884, prot: 0.0, carb: 0.0, fat: 100.0, fib: 0.0 },
    { name: "Ovo cozido M", category: "Ovos", cal: 155, prot: 12.6, carb: 1.1, fat: 10.6, fib: 0.0 },
    { name: "Maçã Gala", category: "Fruta", cal: 52, prot: 0.3, carb: 13.8, fat: 0.2, fib: 2.4 },
    { name: "Lombo de salmão grelhado", category: "Peixes", cal: 206, prot: 22.1, carb: 0.0, fat: 12.3, fib: 0.0 },
    { name: "Pão de centeio integral", category: "Padaria", cal: 220, prot: 8.5, carb: 42.0, fat: 1.5, fib: 6.5 },
    { name: "Amêndoas ao natural", category: "Frutos Secos", cal: 579, prot: 21.2, carb: 21.6, fat: 49.9, fib: 12.5 },
    { name: "Queijo fresco magro", category: "Laticínios", cal: 78, prot: 12.0, carb: 3.5, fat: 1.5, fib: 0.0 },
    { name: "Sementes de chia", category: "Sementes", cal: 486, prot: 16.5, carb: 42.1, fat: 30.7, fib: 34.4 },
  ];

  const createdFoods: Record<string, string> = {};
  for (const f of foodsData) {
    const food = await prisma.food.create({
      data: {
        name: f.name,
        category: f.category,
        caloriesPer100g: f.cal,
        proteinPer100g: f.prot,
        carbsPer100g: f.carb,
        fatPer100g: f.fat,
        fiberPer100g: f.fib,
        source: "GLOBAL",
        isActive: true,
      },
    });
    createdFoods[f.name] = food.id;
  }
  console.log(`✅ Created ${foodsData.length} global foods in database`);

  // 7. Measurement Types
  const measurementTypesData = [
    { name: "Peso corporal", unit: "kg", category: "Geral", order: 1 },
    { name: "Altura", unit: "cm", category: "Geral", order: 2 },
    { name: "Perímetro da Cintura", unit: "cm", category: "Circunferências", order: 3 },
    { name: "Perímetro da Anca", unit: "cm", category: "Circunferências", order: 4 },
    { name: "Massa Gorda (% MG)", unit: "%", category: "Composição Corporal", order: 5 },
    { name: "Massa Muscular", unit: "kg", category: "Composição Corporal", order: 6 },
    { name: "Perímetro do Braço", unit: "cm", category: "Circunferências", order: 7 },
  ];

  const createdMeasurementTypes: Record<string, string> = {};
  for (const m of measurementTypesData) {
    const mt = await prisma.measurementType.create({
      data: {
        name: m.name,
        unit: m.unit,
        category: m.category,
        displayOrder: m.order,
        isGlobal: true,
      },
    });
    createdMeasurementTypes[m.name] = mt.id;
  }
  console.log(`✅ Created ${measurementTypesData.length} measurement types`);

  // 8. Client 1: Ana Pereira (with full active profile, plan, logs, consultations)
  const client1User = await prisma.user.create({
    data: {
      email: "ana.pereira@client.local",
      passwordHash: clientHash,
      role: "CLIENT",
      isActive: true,
      emailVerified: new Date(),
    },
  });

  const client1Profile = await prisma.clientProfile.create({
    data: {
      userId: client1User.id,
      nutritionistId: nutri1Profile.id,
      name: "Ana Pereira",
      email: "ana.pereira@client.local",
      dateOfBirth: new Date("1992-05-14"),
      phone: "+351 934 112 233",
      gender: "Feminino",
      notes: "Objetivo de reeducação alimentar, perda gradual de massa gorda e melhoria de energia diária.",
      status: "ACTIVE",
      joinedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      lastActivityAt: new Date(),
    },
  });

  // Invite record (accepted)
  await prisma.invite.create({
    data: {
      code: "INV-ANA-SOFIA-01",
      nutritionistId: nutri1Profile.id,
      clientId: client1Profile.id,
      clientEmail: "ana.pereira@client.local",
      status: "ACCEPTED",
      acceptedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    },
  });

  // Client 1 Consultations
  const pastConsultation = await prisma.consultation.create({
    data: {
      clientId: client1Profile.id,
      nutritionistId: nutri1Profile.id,
      scheduledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      durationMinutes: 60,
      status: "COMPLETED",
      notes: "Primeira consulta de avaliação global e definição de plano de ação.",
      observations: "Paciente muito motivada. Histórico de quebras de energia a meio da tarde.",
    },
  });

  const recentConsultation = await prisma.consultation.create({
    data: {
      clientId: client1Profile.id,
      nutritionistId: nutri1Profile.id,
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      durationMinutes: 45,
      status: "COMPLETED",
      notes: "Consulta de seguimento. Excelente evolução de peso e adesão de 88% no primeiro mês.",
      observations: "Ajuste ligeiro nas porções do jantar para aumentar saciedade.",
      nextConsultationAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
  });

  const nextConsultation = await prisma.consultation.create({
    data: {
      clientId: client1Profile.id,
      nutritionistId: nutri1Profile.id,
      scheduledAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      durationMinutes: 45,
      status: "SCHEDULED",
      notes: "Consulta agendada de acompanhamento trimestral.",
    },
  });

  // Client 1 Measurements
  const pesoId = createdMeasurementTypes["Peso corporal"];
  const cinturaId = createdMeasurementTypes["Perímetro da Cintura"];
  const gorduraId = createdMeasurementTypes["Massa Gorda (% MG)"];

  // 30 days ago (recorded by Nutritionist in consultation)
  await prisma.measurement.create({
    data: {
      clientId: client1Profile.id,
      measurementTypeId: pesoId,
      value: 68.5,
      unit: "kg",
      measuredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      recordedById: nutri1User.id,
      recordedByRole: "NUTRITIONIST",
      consultationId: pastConsultation.id,
      notes: "Pesagem inicial em consulta.",
    },
  });
  await prisma.measurement.create({
    data: {
      clientId: client1Profile.id,
      measurementTypeId: cinturaId,
      value: 82.0,
      unit: "cm",
      measuredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      recordedById: nutri1User.id,
      recordedByRole: "NUTRITIONIST",
      consultationId: pastConsultation.id,
    },
  });
  await prisma.measurement.create({
    data: {
      clientId: client1Profile.id,
      measurementTypeId: gorduraId,
      value: 29.8,
      unit: "%",
      measuredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      recordedById: nutri1User.id,
      recordedByRole: "NUTRITIONIST",
      consultationId: pastConsultation.id,
    },
  });

  // 15 days ago (recorded by Client at home)
  await prisma.measurement.create({
    data: {
      clientId: client1Profile.id,
      measurementTypeId: pesoId,
      value: 67.4,
      unit: "kg",
      measuredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      recordedById: client1User.id,
      recordedByRole: "CLIENT",
      notes: "Pesagem em jejum na balança de casa.",
    },
  });

  // 7 days ago (recorded by Nutritionist in consultation)
  await prisma.measurement.create({
    data: {
      clientId: client1Profile.id,
      measurementTypeId: pesoId,
      value: 66.8,
      unit: "kg",
      measuredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      recordedById: nutri1User.id,
      recordedByRole: "NUTRITIONIST",
      consultationId: recentConsultation.id,
      notes: "Evolução muito consistente (-1.7kg no total).",
    },
  });
  await prisma.measurement.create({
    data: {
      clientId: client1Profile.id,
      measurementTypeId: cinturaId,
      value: 79.5,
      unit: "cm",
      measuredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      recordedById: nutri1User.id,
      recordedByRole: "NUTRITIONIST",
      consultationId: recentConsultation.id,
    },
  });
  await prisma.measurement.create({
    data: {
      clientId: client1Profile.id,
      measurementTypeId: gorduraId,
      value: 28.3,
      unit: "%",
      measuredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      recordedById: nutri1User.id,
      recordedByRole: "NUTRITIONIST",
      consultationId: recentConsultation.id,
    },
  });

  // Client 1 Goals
  const goalWater = await prisma.goal.create({
    data: {
      clientId: client1Profile.id,
      nutritionistId: nutri1Profile.id,
      title: "Consumo de água",
      description: "Manter hidratação regular ao longo de todo o dia.",
      type: "QUANTITATIVE",
      targetValue: 2.0,
      unit: "L/dia",
      frequency: "Diária",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
    },
  });

  await prisma.goalProgress.create({
    data: {
      goalId: goalWater.id,
      recordedById: client1User.id,
      value: 2.2,
      note: "Garrafa de 1.5L concluída + chás ao longo do dia.",
    },
  });

  await prisma.goal.create({
    data: {
      clientId: client1Profile.id,
      nutritionistId: nutri1Profile.id,
      title: "Cumprimento do plano alimentar",
      description: "Aderência superior a 80% das refeições planeadas.",
      type: "QUANTITATIVE",
      targetValue: 85.0,
      unit: "%",
      frequency: "Semanal",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
    },
  });

  await prisma.goal.create({
    data: {
      clientId: client1Profile.id,
      nutritionistId: nutri1Profile.id,
      title: "Preparação prévia aos domingos (Meal Prep)",
      description: "Cozinhar arroz, legumes e grelhados com antecedência para facilitar a semana de trabalho.",
      type: "BEHAVIORAL",
      frequency: "Semanal",
      status: "ACTIVE",
    },
  });

  // Client 1 Nutrition Plan
  const plan = await prisma.nutritionPlan.create({
    data: {
      nutritionistId: nutri1Profile.id,
      clientId: client1Profile.id,
      title: "Plano Alimentar Equilíbrio & Energia",
      description: "Plano focado em saciedade sustentada, variedade de micronutrientes e otimização da composição corporal.",
      status: "PUBLISHED",
      version: 1,
      startsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  });

  const planDay1 = await prisma.planDay.create({
    data: {
      planId: plan.id,
      dayNumber: 1,
      label: "Dia Geral (Segunda a Sexta)",
      notes: "Plano padrão para dias laborais.",
    },
  });

  // Meal 1: Pequeno-almoço
  const mealBreakfast = await prisma.meal.create({
    data: {
      planDayId: planDay1.id,
      name: "Pequeno-almoço Energético",
      scheduledTime: "08:00",
      orderIndex: 1,
      notes: "Papas de aveia ou taça rápida.",
      instructions: "Misturar a aveia com o iogurte e juntar a banana fatiada e uma pitada de canela a gosto.",
    },
  });

  await prisma.mealItem.create({
    data: {
      mealId: mealBreakfast.id,
      foodId: createdFoods["Flocos de aveia integral"],
      quantity: 45,
      unit: "g",
      orderIndex: 1,
    },
  });
  await prisma.mealItem.create({
    data: {
      mealId: mealBreakfast.id,
      foodId: createdFoods["Iogurte natural magro"],
      quantity: 150,
      unit: "g",
      orderIndex: 2,
    },
  });
  await prisma.mealItem.create({
    data: {
      mealId: mealBreakfast.id,
      foodId: createdFoods["Banana da Madeira"],
      quantity: 1,
      unit: "unidade média (aprox. 90g)",
      orderIndex: 3,
    },
  });

  // Meal 2: Almoço
  const mealLunch = await prisma.meal.create({
    data: {
      planDayId: planDay1.id,
      name: "Almoço Equilibrado",
      scheduledTime: "13:00",
      orderIndex: 2,
      instructions: "Grelhar o frango com ervas aromáticas. Acompanhar com legumes a vapor e arroz basmati temperado com azeite em cru.",
    },
  });

  await prisma.mealItem.create({
    data: {
      mealId: mealLunch.id,
      foodId: createdFoods["Peito de frango grelhado"],
      quantity: 140,
      unit: "g",
      orderIndex: 1,
    },
  });
  await prisma.mealItem.create({
    data: {
      mealId: mealLunch.id,
      foodId: createdFoods["Arroz basmati cozido"],
      quantity: 120,
      unit: "g",
      orderIndex: 2,
    },
  });
  await prisma.mealItem.create({
    data: {
      mealId: mealLunch.id,
      foodId: createdFoods["Brócolos cozidos ao vapor"],
      quantity: 150,
      unit: "g",
      orderIndex: 3,
    },
  });
  await prisma.mealItem.create({
    data: {
      mealId: mealLunch.id,
      foodId: createdFoods["Azeite virgem extra"],
      quantity: 10,
      unit: "ml (1 colher de sobremesa)",
      orderIndex: 4,
    },
  });

  // Meal 3: Lanche da Tarde
  const mealSnack = await prisma.meal.create({
    data: {
      planDayId: planDay1.id,
      name: "Lanche da Tarde",
      scheduledTime: "16:30",
      orderIndex: 3,
      notes: "Fundamental para evitar fome excessiva ao jantar.",
    },
  });

  await prisma.mealItem.create({
    data: {
      mealId: mealSnack.id,
      foodId: createdFoods["Maçã Gala"],
      quantity: 1,
      unit: "unidade",
      orderIndex: 1,
    },
  });
  await prisma.mealItem.create({
    data: {
      mealId: mealSnack.id,
      foodId: createdFoods["Amêndoas ao natural"],
      quantity: 20,
      unit: "g (aprox. 15 unidades)",
      orderIndex: 2,
    },
  });

  // Meal 4: Jantar
  const mealDinner = await prisma.meal.create({
    data: {
      planDayId: planDay1.id,
      name: "Jantar Leve & Rico em Ómega-3",
      scheduledTime: "20:00",
      orderIndex: 4,
      instructions: "Salmão grelhado na chapa sem gordura adicionada. Servir com legumes e salada fresca abundante.",
    },
  });

  await prisma.mealItem.create({
    data: {
      mealId: mealDinner.id,
      foodId: createdFoods["Lombo de salmão grelhado"],
      quantity: 150,
      unit: "g",
      orderIndex: 1,
    },
  });
  await prisma.mealItem.create({
    data: {
      mealId: mealDinner.id,
      foodId: createdFoods["Brócolos cozidos ao vapor"],
      quantity: 180,
      unit: "g",
      orderIndex: 2,
    },
  });
  await prisma.mealItem.create({
    data: {
      mealId: mealDinner.id,
      foodId: createdFoods["Azeite virgem extra"],
      quantity: 5,
      unit: "ml",
      orderIndex: 3,
    },
  });

  // Client 1 Meal Logs (Adherence records for yesterday and today)
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

  await prisma.mealLog.create({
    data: {
      mealId: mealBreakfast.id,
      clientId: client1Profile.id,
      planDayId: planDay1.id,
      logDate: yesterdayStr,
      status: "COMPLETED",
      actualItems: JSON.stringify(["Aveia 45g", "Iogurte grego 150g", "Banana"]),
      note: "Pequeno-almoço cumprido a 100%, muito saciante.",
    },
  });

  await prisma.mealLog.create({
    data: {
      mealId: mealLunch.id,
      clientId: client1Profile.id,
      planDayId: planDay1.id,
      logDate: yesterdayStr,
      status: "COMPLETED",
      actualItems: JSON.stringify(["Frango 140g", "Arroz 120g", "Brócolos", "Azeite"]),
    },
  });

  await prisma.mealLog.create({
    data: {
      mealId: mealSnack.id,
      clientId: client1Profile.id,
      planDayId: planDay1.id,
      logDate: yesterdayStr,
      status: "PARTIAL",
      actualItems: JSON.stringify(["Maçã", "Café com leite", "Sem amêndoas"]),
      note: "Não tinha frutos secos no escritório, comi apenas a maçã.",
    },
  });

  await prisma.mealLog.create({
    data: {
      mealId: mealDinner.id,
      clientId: client1Profile.id,
      planDayId: planDay1.id,
      logDate: yesterdayStr,
      status: "COMPLETED",
      actualItems: JSON.stringify(["Salmão grelhado", "Brócolos", "Salada mista"]),
    },
  });

  // Today Breakfast
  await prisma.mealLog.create({
    data: {
      mealId: mealBreakfast.id,
      clientId: client1Profile.id,
      planDayId: planDay1.id,
      logDate: todayStr,
      status: "COMPLETED",
      note: "Cumprido normalmente às 08:15.",
    },
  });

  // Client 1 Private Note (from Nutritionist)
  await prisma.note.create({
    data: {
      nutritionistId: nutri1Profile.id,
      clientId: client1Profile.id,
      title: "Acompanhamento de Sensibilidade à Insulina",
      content: "A cliente reporta melhora substancial na quebra de energia após o almoço desde a introdução do arroz basmati em porção pesada e adição de fibra ao lanche. Manter este esquema nas próximas 3 semanas.",
      isPrivate: true,
      consultationId: recentConsultation.id,
    },
  });

  // Client 1 Conversation and Messages
  const conversation = await prisma.conversation.create({
    data: {
      nutritionistId: nutri1Profile.id,
      clientId: client1Profile.id,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: nutri1User.id,
      content: "Olá Ana! O novo plano alimentar já está ativo na tua aplicação. Qualquer dúvida com as quantidades podes enviar mensagem por aqui.",
      isRead: true,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: client1User.id,
      content: "Muito obrigada Dra. Sofia! Consegui preparar as marmitas no domingo e está a correr super bem.",
      isRead: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: nutri1User.id,
      content: "Excelente trabalho! Continua com essa consistência. Vemo-nos na próxima consulta.",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  // 9. Client 2: Miguel Costa (Draft plan, recent entry)
  const client2User = await prisma.user.create({
    data: {
      email: "miguel.costa@client.local",
      passwordHash: clientHash,
      role: "CLIENT",
      isActive: true,
      emailVerified: new Date(),
    },
  });

  const client2Profile = await prisma.clientProfile.create({
    data: {
      userId: client2User.id,
      nutritionistId: nutri1Profile.id,
      name: "Miguel Costa",
      email: "miguel.costa@client.local",
      dateOfBirth: new Date("1988-11-20"),
      phone: "+351 918 776 554",
      gender: "Masculino",
      notes: "Praticante regular de corrida e padel. Procura melhorar rendimento e recuperação muscular.",
      status: "ACTIVE",
      joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.invite.create({
    data: {
      code: "INV-MIGUEL-SOFIA-02",
      nutritionistId: nutri1Profile.id,
      clientId: client2Profile.id,
      clientEmail: "miguel.costa@client.local",
      status: "ACCEPTED",
      acceptedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.nutritionPlan.create({
    data: {
      nutritionistId: nutri1Profile.id,
      clientId: client2Profile.id,
      title: "Plano Desportivo e Recuperação (Rascunho)",
      description: "Plano em elaboração para suporte aos treinos de endurance.",
      status: "DRAFT",
      version: 1,
    },
  });

  // 10. Client 3: Beatriz Santos (Unregistered invite with Dr. Tiago Silva)
  const client3Profile = await prisma.clientProfile.create({
    data: {
      nutritionistId: nutri2Profile.id,
      name: "Beatriz Santos",
      email: "beatriz.santos@exemplo.local",
      phone: "+351 961 223 344",
      notes: "Primeira consulta marcada para o final do mês.",
      status: "ACTIVE",
    },
  });

  await prisma.invite.create({
    data: {
      code: "INV-TIAGO-BEA26",
      nutritionistId: nutri2Profile.id,
      clientId: client3Profile.id,
      clientEmail: "beatriz.santos@exemplo.local",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Created demo clients: Ana Pereira (Active with full data), Miguel Costa (Draft plan), Beatriz Santos (Pending invite)");
  console.log("🏁 Seed complete! Ready for local development and testing.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
