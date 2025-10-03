// src/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin?: boolean;
      hasPaid?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    isAdmin?: boolean;
    hasPaid?: boolean;
  }
}
