import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "nutritionist-management-super-secret-jwt-key-32charsmin!"
);

const SESSION_COOKIE_NAME = "nutri_session";

interface SessionPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "NUTRITIONIST" | "CLIENT";
}

async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/register-client");

  // Redirect logged-in users away from auth pages
  if (isAuthPage && session) {
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (session.role === "NUTRITIONIST") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (session.role === "CLIENT") {
      return NextResponse.redirect(new URL("/client", request.url));
    }
  }

  // Protected paths
  const isNutritionistRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/plans") ||
    pathname.startsWith("/foods") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/settings");

  // Client portal routes are strictly /client or /client/* (NOT /clients/* which belongs to nutritionists)
  const isClientRoute = pathname === "/client" || pathname.startsWith("/client/");
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isNutritionistRoute || isClientRoute || isAdminRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role Enforcement
    if (isNutritionistRoute && session.role !== "NUTRITIONIST" && session.role !== "ADMIN") {
      if (session.role === "CLIENT") {
        return NextResponse.redirect(new URL("/client", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isClientRoute && session.role !== "CLIENT") {
      if (session.role === "NUTRITIONIST") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (session.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    if (isAdminRoute && session.role !== "ADMIN") {
      if (session.role === "NUTRITIONIST") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (session.role === "CLIENT") {
        return NextResponse.redirect(new URL("/client", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Root redirect
  if (pathname === "/") {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (session.role === "NUTRITIONIST") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (session.role === "CLIENT") {
      return NextResponse.redirect(new URL("/client", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
