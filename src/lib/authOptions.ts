// src/lib/authOptions.ts
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }: any) {
      session.user.id = user.id;
      session.user.isAdmin = user.isAdmin;
      session.user.hasPaid = user.hasPaid;
      return session;
    },

    async signIn({ user }: any) {
      // Si el usuario es ADMIN_EMAIL => activamos admin y pago
      if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isAdmin: true, hasPaid: true },
        });
      }
      return true;
    },

    // ✅ Redirigir después de login a /planes
    async redirect({ url, baseUrl }) {
      return "/planes";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
