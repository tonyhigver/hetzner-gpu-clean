// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Evita crear múltiples instancias de Prisma en desarrollo
  var prisma: PrismaClient | undefined;
}

// 🔹 Evita múltiples instancias en desarrollo y serverless
const prisma = global.prisma || new PrismaClient({
  log: ["query", "info", "warn", "error"], // Logs opcionales
});

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
