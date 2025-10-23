// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Evita crear múltiples instancias de Prisma en desarrollo
  // @ts-ignore
  var prisma: PrismaClient | undefined;
}

// ✅ Reutilizar la instancia global si existe (solo en desarrollo)
const prisma = global.prisma || new PrismaClient({
  log: ["query", "info", "warn", "error"], // Opcional: puedes quitar logs si quieres
});

// Solo asignamos a global en desarrollo para evitar múltiples instancias
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
