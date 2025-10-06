"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Header fijo arriba */}
      <Header />
      {/* Spacer: fuerza que el contenido quede debajo del header */}
      <div className="h-28" /> {/* 112px de altura, igual que tu header */}
      {/* Contenido de la página */}
      <div>{children}</div>
    </SessionProvider>
  );
}
