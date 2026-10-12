import { PrismaClient } from "@prisma/client";
import { signToken } from "../lib/auth";
import * as fs from "fs";

const prisma = new PrismaClient();

async function inspectHtml() {
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

  const res = await fetch(`http://localhost:3000/clients/${client.id}?tab=overview`, {
    headers: { Cookie: `nutri_session=${token}` },
  });
  const html = await res.text();
  console.log("Status:", res.status);
  console.log("Length:", html.length);
  console.log("Contains 'A carregar ficha clínica':", html.includes("A carregar ficha clínica"));
  console.log("Contains 'Ficha Clínica Geral':", html.includes("Ficha Clínica Geral"));
  console.log("Contains 'Consultas & Agenda':", html.includes("Consultas & Agenda"));
  console.log("Contains 'Índice de Massa Corporal':", html.includes("Índice de Massa Corporal"));
  console.log("Contains 'Linha Temporal':", html.includes("Linha Temporal"));

  await prisma.$disconnect();
}

inspectHtml().catch(console.error);
