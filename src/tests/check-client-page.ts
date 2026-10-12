import { PrismaClient } from "@prisma/client";
import { signToken } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  const nutri = await prisma.nutritionistProfile.findFirst({ include: { user: true } });
  if (!nutri) throw new Error("No nutritionist");

  const clients = await prisma.clientProfile.findMany({
    where: { nutritionistId: nutri.id },
    include: { consultations: true, measurements: true },
  });

  console.log(`Found ${clients.length} clients for nutritionist ${nutri.user.email}`);

  const token = await signToken({
    userId: nutri.userId,
    email: nutri.user.email,
    role: "NUTRITIONIST",
    name: "Sofia Martins",
    nutritionistProfileId: nutri.id,
  });

  for (const client of clients.slice(0, 3)) {
    console.log(`\nTesting client: ${client.name} (${client.id})`);
    const res = await fetch(`http://localhost:3000/clients/${client.id}`, {
      headers: { Cookie: `nutri_session=${token}` },
    });
    console.log(`Status: ${res.status}`);
    const html = await res.text();
    if (res.status !== 200 || html.includes("Application error") || html.includes("An error occurred")) {
      console.log("ERROR on page! Snippet:", html.slice(0, 500));
    } else {
      console.log(`Page rendered successfully! (HTML length: ${html.length})`);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
