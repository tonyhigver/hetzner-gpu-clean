// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// 🔹 Evita crear múltiples instancias de Prisma en desarrollo
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// 🔹 Mantén una única instancia en desarrollo
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
