import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { canAccessCmsPath, type StaffRole } from "@/lib/cms-access";

/**
 * Edge-safe middleware — uses auth.config only (no DB / pg).
 * Credentials authorize stays in auth.ts (Node runtime).
 */
const { auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    authorized({ auth: session, request }) {
      const path = request.nextUrl.pathname;
      if (!path.startsWith("/cms")) return true;
      return !!session?.user;
    },
  },
});

export default auth((req) => {
  const path = req.nextUrl.pathname;
  if (!path.startsWith("/cms")) {
    return NextResponse.next();
  }

  if (!req.auth?.user) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(login);
  }

  const role = (req.auth.user as { role?: string }).role as
    | StaffRole
    | undefined;
  if (role && !canAccessCmsPath(role, path)) {
    return NextResponse.redirect(new URL("/cms", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/cms/:path*"],
};
