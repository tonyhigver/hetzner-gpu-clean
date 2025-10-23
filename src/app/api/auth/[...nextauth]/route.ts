// 📄 src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // 🔹 Importamos la configuración desde lib

// 🔹 Creamos el handler de NextAuth con la configuración
const handler = NextAuth(authOptions);

// 🔹 Exportamos GET y POST para que Next.js reconozca la ruta
export { handler as GET, handler as POST };
