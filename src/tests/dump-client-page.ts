import { PrismaClient } from "@prisma/client";
import { signToken } from "../lib/auth";

const prisma = new PrismaClient();

async function check() {
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

  const res = await fetch(`http://localhost:3000/clients/${client.id}`, {
    headers: { Cookie: `nutri_session=${token}` },
    redirect: "manual",
  });
  console.log("Status:", res.status);
  console.log("Headers:", Object.fromEntries(res.headers.entries()));
  const html = await res.text();
  console.log("HTML Start:\n", html.slice(0, 1000));
  await prisma.$disconnect();
}

check().catch(console.error);
