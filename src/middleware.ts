import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

/**
 * Edge-safe middleware — uses auth.config only (no DB / pg).
 * Credentials authorize stays in auth.ts (Node runtime).
 */
const { auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    authorized({ auth: session, request }) {
      if (process.env.NODE_ENV === "development") return true;
      const path = request.nextUrl.pathname;
      if (path.startsWith("/cms")) return !!session?.user;
      return true;
    },
  },
});

export default auth((req) => {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }
  const path = req.nextUrl.pathname;
  if (path.startsWith("/cms") && !req.auth) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/cms/:path*"],
};
