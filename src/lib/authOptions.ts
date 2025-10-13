// src/lib/authOptions.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const authOptions = {
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

  session: {
    strategy: "database", // ✅ asegura que use PrismaAdapter correctamente
  },

  callbacks: {
    // ✅ Incluye siempre todos los campos necesarios en la sesión
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.isAdmin = user.isAdmin ?? false;
        session.user.hasPaid = user.hasPaid ?? false;
      }
      return session;
    },

    // ✅ Marca al admin automáticamente
    async signIn({ user }) {
      if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { isAdmin: true, hasPaid: true },
          });
        } catch (err) {
          console.error("Error al actualizar admin:", err);
        }
      }
      return true;
    },

    async redirect({ url, baseUrl }) {
      // ✅ Evita redirecciones externas inseguras
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
};
