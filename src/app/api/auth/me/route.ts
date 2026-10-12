import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Fetch fresh profile state
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      nutritionistProfile: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          licenseNumber: true,
          subscription: {
            select: {
              status: true,
              plan: { select: { name: true, slug: true } },
            },
          },
        },
      },
      clientProfile: {
        select: {
          id: true,
          name: true,
          nutritionist: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
