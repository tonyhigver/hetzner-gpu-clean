"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* 🔝 Header fijo arriba */}
      <Header />

      {/* 🧩 Contenido principal centrado y limpio, sin duplicar fondo ni header */}
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-950 w-full px-6">
        {children}
      </main>
    </SessionProvider>
  );
}
