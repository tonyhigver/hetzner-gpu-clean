"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Header fijo arriba */}
      <Header />

      {/* Sección con GPU SaaS centrado */}
      <div className="h-28 flex items-center justify-center bg-gray-900">
        <h1 className="text-4xl font-bold text-white tracking-wide">GPU SaaS</h1>
      </div>

      {/* Contenido de las páginas */}
      <main className="px-12 max-w-6xl mx-auto w-full mt-8 flex flex-col">
        {children}
      </main>
    </SessionProvider>
  );
}
