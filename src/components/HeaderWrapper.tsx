"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Header fijo arriba */}
      <Header />

      {/* Espaciador: asegura que el contenido quede justo debajo del header */}
      <div className="h-28" /> {/* Altura igual al header */}

      {/* Contenido de las páginas */}
      <div className="px-12 max-w-6xl mx-auto w-full">
        {children}
      </div>
    </SessionProvider>
  );
}
