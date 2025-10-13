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
        params: {
          // ✅ Pedimos explícitamente el correo y el perfil
          scope: "openid email profile",
        },
      },
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
    // ✅ Incluir todos los campos relevantes en la sesión
    async session({ session, user }: any) {
      session.user.id = user.id;
      session.user.email = user.email; // 👈 ahora el correo estará siempre disponible
      session.user.isAdmin = user.isAdmin ?? false;
      session.user.hasPaid = user.hasPaid ?? false;
      return session;
    },

    // ✅ Si el email coincide con el admin, se actualizan permisos
    async signIn({ user }: any) {
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
      // Si la URL es interna
      if (url && url.startsWith(baseUrl)) return url;

      // Si no, devolvemos undefined para permitir redirecciones del router
      return undefined;
    },
  },
};
