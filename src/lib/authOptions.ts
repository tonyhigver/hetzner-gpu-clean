// src/lib/authOptions.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import { NextAuthOptions } from "next-auth"; // 🔹 Importa el tipo

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  // ✅ Evita errores "OAuth state mismatch"
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },

  callbacks: {
    // ✅ Almacenar datos del usuario en la sesión
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.isAdmin = user.isAdmin;
      session.user.hasPaid = user.hasPaid;
      return session;
    },

    // ✅ Si es el admin, se le asignan permisos
    async signIn({ user }) {
      if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isAdmin: true, hasPaid: true },
        });
      }
      return true;
    },

    // 🔹 Permitimos que la app decida a dónde ir después del login
    async redirect({ url, baseUrl }) {
      if (url && url.startsWith(baseUrl)) return url;
      return undefined;
    },
  },
};