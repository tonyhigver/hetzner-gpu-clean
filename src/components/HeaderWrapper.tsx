"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Header fijo arriba */}
      <Header />

      {/* Espaciador exacto para empujar el contenido */}
      <div className="mt-[7.5rem]" /> {/* 7.5rem ≈ 120px → un pelín más que h-28 */}

      {/* Contenido de las páginas */}
      <main className="px-12 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </SessionProvider>
  );
}
