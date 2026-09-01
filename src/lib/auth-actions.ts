"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!process.env.DATABASE_URL) {
    return {
      error:
        "Database not configured. Add DATABASE_URL to .env.local, then run db:push and db:seed.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/cms",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw err;
  }

  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
