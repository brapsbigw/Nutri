import { PrismaClient } from "@prisma/client";
import { signToken, verifyToken } from "../lib/auth";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  details?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(category: string, name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    results.push({ category, name, passed: true, durationMs: Date.now() - start });
    console.log(`✅ [${category}] ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    results.push({ category, name, passed: false, details: err.message, durationMs: Date.now() - start });
    console.error(`❌ [${category}] ${name}: ${err.message}`);
  }
}

async function main() {
  console.log("=================================================");
  console.log("   NUTRITIONIST MANAGEMENT - AUDIT & TEST SUITE   ");
  console.log("=================================================\n");

  // 1. Database Health & Baseline Seed Check
  await runTest("Database", "Database Connection & Seeding Verification", async () => {
    const nutriCount = await prisma.nutritionistProfile.count();
    const clientCount = await prisma.clientProfile.count();
    const foodCount = await prisma.food.count();
    const planCount = await prisma.nutritionPlan.count();

    if (nutriCount === 0 || clientCount === 0 || foodCount === 0) {
      throw new Error(`Insufficient seed data: Nutris=${nutriCount}, Clients=${clientCount}, Foods=${foodCount}`);
    }
  });

  // 2. Authentication & JWT Tokens
  let nutriCookie = "";
  let clientCookie = "";
  let adminCookie = "";

  await runTest("Auth", "Nutritionist Login (Sofia Martins)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "sofia.martins@clinic.local", password: "Nutritionist123!" }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    const cookie = res.headers.get("set-cookie");
    if (!cookie) throw new Error("No set-cookie returned");
    nutriCookie = cookie.split(";")[0];
  });

  await runTest("Auth", "Admin Login", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@nutritionist.local", password: "AdminPassword123!" }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    const cookie = res.headers.get("set-cookie");
    if (!cookie) throw new Error("No set-cookie returned");
    adminCookie = cookie.split(";")[0];
  });

  // 3. Client Creation & Invite Flow
  let createdClientId = "";
  let inviteCode = "";

  await runTest("Clients", "Create Client via Nutritionist API", async () => {
    const testEmail = `teste-${Date.now()}@exemplo.pt`;
    const res = await fetch(`${BASE_URL}/api/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: nutriCookie,
      },
      body: JSON.stringify({
        name: "Mariana Teste Audit",
        email: testEmail,
        phone: "+351 912 345 678",
        gender: "Feminino",
        notes: "Cliente criada pelo teste automático de auditoria clínica.",
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    const data = await res.json();
    if (!data.client?.id) {
      throw new Error("Client missing from response");
    }
    createdClientId = data.client.id;
    inviteCode = data.client.invite?.code || data.invite?.code;
    if (!inviteCode) {
      throw new Error("Invite code missing from response");
    }
  });

  // 4. Client Activation Flow via Invite Code
  const clientEmail = `mariana.client.${Date.now()}@exemplo.pt`;
  await runTest("Clients", "Activate Client Account via /api/auth/register-client", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register-client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inviteCode,
        name: "Mariana Teste Audit",
        email: clientEmail,
        password: "ClientPassword123!",
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    const cookie = res.headers.get("set-cookie");
    if (!cookie) throw new Error("No cookie returned on client registration");
    clientCookie = cookie.split(";")[0];
  });

  // 5. Clinical Operations: Measurements
  await runTest("Clinical", "Add Body Measurements for Client", async () => {
    const weightType = await prisma.measurementType.findFirst({
      where: { name: { contains: "Peso" } },
    });
    if (!weightType) throw new Error("No weight measurement type found");

    const res = await fetch(`${BASE_URL}/api/clients/${createdClientId}/measurements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: nutriCookie,
      },
      body: JSON.stringify({
        measurementTypeId: weightType.id,
        value: 64.5,
        unit: "kg",
        notes: "Primeira consulta de avaliação física completa.",
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
  });

  // 6. Clinical Operations: Goals
  await runTest("Clinical", "Add Clinical Goal for Client", async () => {
    const res = await fetch(`${BASE_URL}/api/clients/${createdClientId}/goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: nutriCookie,
      },
      body: JSON.stringify({
        title: "Beber 2L de água por dia",
        description: "Manter garrafa de 1L na secretária durante o dia.",
        targetDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
  });

  // 7. Clinical Operations: Confidential Private Notes
  await runTest("Clinical", "Save Confidential Clinical Note (Nutritionist Eyes Only)", async () => {
    const res = await fetch(`${BASE_URL}/api/clients/${createdClientId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: nutriCookie,
      },
      body: JSON.stringify({
        content: "Nota privada confidencial: Paciente refere histórico familiar de intolerância à lactose.",
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
  });

  // Verify that Client CANNOT read nutritionist's private notes
  await runTest("Security", "Client Cannot Access Confidential Clinical Notes", async () => {
    const res = await fetch(`${BASE_URL}/api/clients/${createdClientId}/notes`, {
      headers: { Cookie: clientCookie },
    });
    // Should be 403 Forbidden or 401 Unauthorized
    if (res.status !== 403 && res.status !== 401) {
      throw new Error(`Expected 403/401, but got ${res.status}`);
    }
  });

  // 8. Food Database Operations
  let createdFoodId = "";
  await runTest("Foods", "Create Custom Food Item in Clinic Database", async () => {
    const res = await fetch(`${BASE_URL}/api/foods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: nutriCookie,
      },
      body: JSON.stringify({
        name: "Pão de Centeio Artesanal Integral",
        category: "Cereais e Derivados",
        calories: 220,
        protein: 8.5,
        carbs: 42.0,
        fat: 1.8,
        fiber: 6.2,
        standardPortion: "1 fatia média (50g)",
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    const data = await res.json();
    createdFoodId = data.food?.id || data.id;
  });

  // 9. Nutrition Plan Creation
  let createdPlanId = "";
  await runTest("Plans", "Create Structured Meal Plan for Client", async () => {
    const res = await fetch(`${BASE_URL}/api/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: nutriCookie,
      },
      body: JSON.stringify({
        clientId: createdClientId,
        title: "Plano de Reeducação Alimentar e Equilíbrio",
        status: "PUBLISHED",
        calorieTarget: 1850,
        proteinTarget: 110,
        carbsTarget: 200,
        fatTarget: 55,
        hydrationTarget: 2.2,
        guidelines: "Mastigar devagar, evitar ecrãs durante as refeições, priorizar alimentos frescos e sazonais.",
        days: [
          {
            dayOfWeek: 1,
            name: "Segunda-feira",
            meals: [
              {
                name: "Pequeno-almoço",
                time: "08:00",
                notes: "Acompanhar com chá verde sem açúcar",
                items: [
                  {
                    foodId: createdFoodId,
                    customFoodName: "Pão de Centeio Artesanal Integral",
                    quantity: "2 fatias",
                    calories: 220,
                    protein: 8.5,
                    carbs: 42,
                    fat: 1.8,
                  },
                ],
              },
            ],
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    const data = await res.json();
    createdPlanId = data.plan?.id || data.id;
  });

  // 10. Client Portal Verification: Read Plan
  await runTest("ClientPortal", "Client Reads Their Assigned Meal Plan", async () => {
    const res = await fetch(`${BASE_URL}/client/plan`, {
      headers: { Cookie: clientCookie },
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
  });

  // 11. Client Portal: Meal Log / Check-in
  await runTest("ClientPortal", "Client Logs Daily Meal Adherence", async () => {
    const meal = await prisma.meal.findFirst({
      where: { planDay: { planId: createdPlanId } },
    });
    if (!meal) throw new Error("Created meal not found in database");

    const res = await fetch(`${BASE_URL}/api/client/meal-log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: clientCookie,
      },
      body: JSON.stringify({
        mealId: meal.id,
        status: "COMPLETED",
        logDate: new Date().toISOString().split("T")[0],
        note: "Consumido conforme planeado, senti-me saciada.",
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
  });

  // 12. Consultations & Scheduling
  let consultationId = "";
  await runTest("Calendar", "Schedule Consultation with Client", async () => {
    const scheduledDate = new Date(Date.now() + 7 * 86400000);
    const res = await fetch(`${BASE_URL}/api/clients/${createdClientId}/consultations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: nutriCookie,
      },
      body: JSON.stringify({
        scheduledAt: scheduledDate.toISOString(),
        durationMinutes: 45,
        type: "FOLLOW_UP",
        notes: "Consulta de seguimento de 1 mês para revisão de medidas.",
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    const data = await res.json();
    consultationId = data.consultation?.id || data.id;
  });

  // 13. Bi-directional Messaging
  await runTest("Messaging", "Nutritionist Sends Message to Client", async () => {
    const res = await fetch(`${BASE_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: nutriCookie,
      },
      body: JSON.stringify({
        clientId: createdClientId,
        content: "Olá Mariana! O teu plano alimentar já está ativo na tua área de cliente.",
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
  });

  await runTest("Messaging", "Client Replies to Nutritionist", async () => {
    const res = await fetch(`${BASE_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: clientCookie,
      },
      body: JSON.stringify({
        content: "Muito obrigada, Doutora! Já fiz o check-in do pequeno-almoço de hoje.",
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
  });

  // 14. Admin Operations: Generate Trial Key & Audit Log
  await runTest("Admin", "Admin Generates New Trial Key for Clinic", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/trial-keys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        daysValid: 30,
        notes: "Chave criada no teste de auditoria para clínica parceira",
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
  });

  // 15. Multi-Tenant Cross-Isolation Test (Dr. Tiago trying to access Sofia's client)
  await runTest("Security", "Multi-Tenancy Isolation (Cross-Nutritionist Access Blocked)", async () => {
    const loginTiago = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "tiago.silva@nutri.local", password: "Nutritionist123!" }),
    });
    const tiagoCookie = loginTiago.headers.get("set-cookie")?.split(";")[0] || "";

    const res = await fetch(`${BASE_URL}/api/clients/${createdClientId}/notes`, {
      headers: { Cookie: tiagoCookie },
    });
    if (res.status !== 403 && res.status !== 404) {
      throw new Error(`Expected 403 or 404 for cross-nutritionist access, got ${res.status}`);
    }
  });

  console.log("\n=================================================");
  const passed = results.filter((r) => r.passed).length;
  console.log(`RESULTS: ${passed}/${results.length} TESTS PASSED`);
  console.log("=================================================");

  // Output JSON for the report
  console.log("\n--- JSON SUMMARY ---");
  console.log(JSON.stringify(results, null, 2));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("FATAL ERROR IN TEST SUITE:", err);
  process.exit(1);
});
