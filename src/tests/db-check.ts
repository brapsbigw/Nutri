import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function check() {
  const clients = await prisma.clientProfile.findMany({ select: { id: true, name: true }, take: 5 });
  console.log("Clients in DB:", JSON.stringify(clients, null, 2));
  const nutris = await prisma.nutritionistProfile.findMany({ select: { id: true, userId: true }, take: 2 });
  console.log("Nutritionists:", JSON.stringify(nutris, null, 2));
  console.log("Plans:", await prisma.nutritionPlan.count());
  console.log("Foods:", await prisma.food.count());
  console.log("Consultations:", await prisma.consultation.count());
  console.log("Measurements:", await prisma.measurement.count());
  console.log("Notes:", await prisma.note.count());
  console.log("MealLogs:", await prisma.mealLog.count());
  console.log("Users:", await prisma.user.count());
  await prisma["$disconnect"]();
}
check().catch(console.error);
