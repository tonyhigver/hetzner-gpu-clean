// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";  // ⚠ Import correcto para App Router
import { authOptions } from "@/lib/authOptions";

// Crear el handler de NextAuth usando las opciones centralizadas
const handler = NextAuth(authOptions);

// Exportar el handler para cada método HTTP que Next.js espera
export { handler as GET, handler as POST };
