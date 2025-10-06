"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Header fijo */}
      <Header />
      {/* Spacer para empujar el contenido debajo del header */}
      <div className="h-28" /> {/* 112px = altura del header */}
      {/* Contenido de la página */}
      {children}
    </SessionProvider>
  );
}
