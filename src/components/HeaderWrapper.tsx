"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* ✅ Header siempre visible */}
      <Header />

      {/* ✅ Contenido sin div adicional que rompa el diseño */}
      {children}
    </SessionProvider>
  );
}
