"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* 🔝 Header fijo arriba */}
      <Header />

      {/* 🧩 Contenido principal centrado (sin el texto GPU SaaS) */}
      <main className="flex flex-col items-center justify-center bg-gray-950 min-h-screen pt-20">
        {children}
      </main>
    </SessionProvider>
  );
}
