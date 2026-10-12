import { PrismaClient } from "@prisma/client";
import { signToken } from "../lib/auth";

const prisma = new PrismaClient();

async function testPage() {
  const nutri = await prisma.nutritionistProfile.findFirst({ include: { user: true } });
  if (!nutri) throw new Error("No nutri");
  const client = await prisma.clientProfile.findFirst({ where: { nutritionistId: nutri.id } });
  if (!client) throw new Error("No client");

  const token = await signToken({
    userId: nutri.userId,
    email: nutri.user.email,
    role: "NUTRITIONIST",
    name: "Sofia Martins",
    nutritionistProfileId: nutri.id,
  });

  const url = `http://localhost:3000/clients/${client.id}?tab=overview`;
  console.log("Fetching:", url);
  const res = await fetch(url, {
    headers: { Cookie: `nutri_session=${token}` },
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Length:", text.length);
  if (text.includes("Application error") || text.includes("An error occurred") || text.includes("500 Internal Server Error")) {
    console.log("ERROR DETECTED in response HTML:");
    console.log(text.slice(0, 1500));
  } else {
    console.log("SUCCESS! Contains client name:", text.includes(client.name));
    console.log("Contains 'Avaliação Antropométrica':", text.includes("Avaliação Antropométrica"));
  }
  await prisma.$disconnect();
}

testPage().catch(console.error);
