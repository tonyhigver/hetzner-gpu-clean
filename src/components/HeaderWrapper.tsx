"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Header fijo arriba */}
      <Header />
      {/* Spacer exacto: altura igual al header */}
      <div className="h-28" /> {/* 112px */}
      {/* Contenido de la página */}
      <div>{children}</div>
    </SessionProvider>
  );
}
