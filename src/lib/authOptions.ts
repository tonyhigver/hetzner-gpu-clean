// src/lib/authOptions.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import type { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: { scope: "openid email profile" },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  // ✅ Usamos base de datos para almacenar las sesiones
  session: {
    strategy: "database",
  },

  callbacks: {
    // ✅ Incluye los campos importantes del usuario en la sesión
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.isAdmin = user.isAdmin ?? false;
        session.user.hasPaid = user.hasPaid ?? false;
      }
      return session;
    },

    // ✅ Marca automáticamente al administrador si el correo coincide
    async signIn({ user }) {
      if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { isAdmin: true, hasPaid: true },
          });
        } catch (err) {
          console.error("❌ Error al actualizar admin:", err);
        }
      }
      return true;
    },

    // ✅ Control de redirecciones seguras
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
};
