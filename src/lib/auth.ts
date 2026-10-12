import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import prisma from "@/lib/prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "nutritionist-management-super-secret-jwt-key-32charsmin!"
);

const SESSION_COOKIE_NAME = "nutri_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "NUTRITIONIST" | "CLIENT";
  name: string;
  nutritionistProfileId?: string | null;
  clientProfileId?: string | null;
  clinicId?: string | null;
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Backend Tenant Validation:
 * Ensures a nutritionist can only access their own clients.
 * Throws an Error or returns null if unauthorized.
 */
export async function verifyNutritionistClientAccess(
  nutritionistUserId: string,
  clientId: string
): Promise<boolean> {
  const profile = await prisma.nutritionistProfile.findUnique({
    where: { userId: nutritionistUserId },
  });
  if (!profile) return false;

  const client = await prisma.clientProfile.findFirst({
    where: {
      id: clientId,
      nutritionistId: profile.id,
      deletedAt: null,
    },
  });

  return !!client;
}

/**
 * Backend Tenant Validation:
 * Ensures a client user can only access their own data.
 */
export async function verifyClientSelfAccess(
  clientUserId: string,
  targetClientId: string
): Promise<boolean> {
  const client = await prisma.clientProfile.findFirst({
    where: {
      id: targetClientId,
      userId: clientUserId,
      deletedAt: null,
    },
  });
  return !!client;
}
