"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!process.env.DATABASE_URL) {
    return {
      error:
        "Database not configured. Add DATABASE_URL to .env.local, then run db:push and db:seed.",
    };
  }

  if (!email || !password) {
    return { error: "Enter email and password." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (err) {
    // Successful redirects must not be swallowed as login failures.
    if (isRedirectError(err)) throw err;
    if (err instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    console.error("[login]", err);
    return {
      error:
        "Sign-in is temporarily unavailable (database waking up). Wait a few seconds and try again.",
    };
  }

  redirect("/cms");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
