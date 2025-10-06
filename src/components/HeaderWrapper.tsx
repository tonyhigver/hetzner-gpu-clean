"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Header fijo arriba */}
      <Header />
      {/* Spacer: empuja todo el contenido debajo del header */}
      <div className="h-28" /> {/* igual que la altura del header */}
      {/* Contenido de la página */}
      {children}
    </SessionProvider>
  );
}
