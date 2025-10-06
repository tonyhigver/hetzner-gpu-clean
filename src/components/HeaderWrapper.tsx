"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Header fijo arriba */}
      <Header />

      {/* Contenido de las páginas, separado correctamente del header */}
      <main className="pt-24 px-12 max-w-6xl mx-auto">
        {children}
      </main>
    </SessionProvider>
  );
}
