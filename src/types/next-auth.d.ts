declare module "next-auth" {
  interface User {
    role?: "admin" | "editor" | "reporter";
  }
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role?: "admin" | "editor" | "reporter";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export {};
