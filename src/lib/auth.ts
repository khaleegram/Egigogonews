import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, withDbRetry } from "@/db";
import { users } from "@/db/schema";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse({
          email: String(raw?.email ?? "")
            .trim()
            .toLowerCase(),
          password: String(raw?.password ?? ""),
        });
        if (!parsed.success) return null;

        try {
          const row = await withDbRetry(async () => {
            const db = getDb();
            const [user] = await db
              .select()
              .from(users)
              .where(eq(users.email, parsed.data.email))
              .limit(1);
            return user ?? null;
          });

          if (!row || !row.active) return null;

          const ok = await compare(parsed.data.password, row.passwordHash);
          if (!ok) return null;

          return {
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
          };
        } catch (err) {
          console.error("[auth.authorize]", err);
          return null;
        }
      },
    }),
  ],
});
