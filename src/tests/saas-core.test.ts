import { describe, it, before } from "node:test";
import assert from "node:assert";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { verifyNutritionistClientAccess, verifyClientSelfAccess, signToken, verifyToken } from "../lib/auth";

describe("Nutritionist Management SaaS - Core Verification Tests", () => {
  let nutri1: any;
  let nutri2: any;
  let client1: any;
  let client2: any;

  before(async () => {
    // Look up seeded nutritionists and clients
    nutri1 = await prisma.nutritionistProfile.findFirst({
      where: { name: { contains: "Sofia" } },
      include: { user: true, subscription: { include: { plan: true } } },
    });

    nutri2 = await prisma.nutritionistProfile.findFirst({
      where: { name: { contains: "Tiago" } },
      include: { user: true, subscription: { include: { plan: true } } },
    });

    client1 = await prisma.clientProfile.findFirst({
      where: { name: { contains: "Ana Pereira" } },
      include: { user: true },
    });

    client2 = await prisma.clientProfile.findFirst({
      where: { name: { contains: "Miguel Costa" } },
      include: { user: true },
    });
  });

  it("1. MULTI-TENANT ISOLATION: Nutritionist A has access to their own client", async () => {
    assert.ok(nutri1, "Nutri 1 exists");
    assert.ok(client1, "Client 1 exists");

    const hasAccess = await verifyNutritionistClientAccess(nutri1.userId, client1.id);
    assert.strictEqual(hasAccess, true, "Sofia Martins must have access to Ana Pereira");
  });

  it("2. MULTI-TENANT ISOLATION (CRITICAL): Nutritionist B CANNOT access Nutritionist A's client", async () => {
    assert.ok(nutri2, "Nutri 2 exists");
    assert.ok(client1, "Client 1 exists");

    const hasAccess = await verifyNutritionistClientAccess(nutri2.userId, client1.id);
    assert.strictEqual(
      hasAccess,
      false,
      "Dr. Tiago Silva MUST NOT have access to Ana Pereira (owned by Dra. Sofia Martins)"
    );
  });

  it("3. CLIENT DATA ISOLATION: Client cannot access another client's data", async () => {
    assert.ok(client1.userId, "Client 1 has user account");
    assert.ok(client2.id, "Client 2 exists");

    const hasSelfAccess = await verifyClientSelfAccess(client1.userId, client1.id);
    assert.strictEqual(hasSelfAccess, true, "Ana Pereira can access her own record");

    const hasOtherAccess = await verifyClientSelfAccess(client1.userId, client2.id);
    assert.strictEqual(hasOtherAccess, false, "Ana Pereira CANNOT access Miguel Costa's record");
  });

  it("4. JWT SESSION CRYPTO: Signs and verifies tamper-proof session tokens", async () => {
    const payload = {
      userId: nutri1.userId,
      email: nutri1.user.email,
      role: "NUTRITIONIST" as const,
      name: nutri1.name,
      nutritionistProfileId: nutri1.id,
    };

    const token = await signToken(payload);
    assert.ok(token && typeof token === "string", "Token was generated");

    const verified = await verifyToken(token);
    assert.ok(verified, "Token verified successfully");
    assert.strictEqual(verified.email, nutri1.user.email);
    assert.strictEqual(verified.role, "NUTRITIONIST");

    // Tampered token check
    const tamperedToken = token.slice(0, -6) + "XXXXXX";
    const invalid = await verifyToken(tamperedToken);
    assert.strictEqual(invalid, null, "Tampered token must fail verification");
  });

  it("5. TRIAL KEY SECURITY: Unused trial key exists and has duration", async () => {
    const unusedKey = await prisma.trialKey.findFirst({
      where: { status: "UNUSED" },
    });

    assert.ok(unusedKey, "Unused trial key exists for testing");
    assert.strictEqual(unusedKey.status, "UNUSED");
    assert.ok(unusedKey.durationDays >= 14, "Duration must be valid");
  });

  it("6. ADHERENCE & MEAL TRACKING: Ana Pereira has meal logs recorded", async () => {
    const logs = await prisma.mealLog.findMany({
      where: { clientId: client1.id },
    });

    assert.ok(logs.length > 0, "Client has adherence logs");
    const completed = logs.filter((l) => l.status === "COMPLETED");
    assert.ok(completed.length > 0, "Has completed meals");
  });

  it("7. CLINICAL NOTES CONFIDENTIALITY: Private notes exist and have isPrivate = true", async () => {
    const notes = await prisma.note.findMany({
      where: { clientId: client1.id },
    });

    assert.ok(notes.length > 0, "Has clinical notes");
    for (const note of notes) {
      assert.strictEqual(note.isPrivate, true, "Notes must be marked private");
    }
  });

  it("8. PLAN STRUCTURE INTEGRITY: Published plan has days, meals, and food items", async () => {
    const plan = await prisma.nutritionPlan.findFirst({
      where: { clientId: client1.id, status: "PUBLISHED" },
      include: {
        days: {
          include: {
            meals: {
              include: { items: true },
            },
          },
        },
      },
    });

    assert.ok(plan, "Active published plan exists");
    assert.ok(plan.days.length > 0, "Plan has days");
    assert.ok(plan.days[0].meals.length > 0, "Day has meals");
    assert.ok(plan.days[0].meals[0].items.length > 0, "Meal has food items");
  });
});
