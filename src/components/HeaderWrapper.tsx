"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* ✅ Header siempre fijo arriba */}
      <Header />
      {/* ✅ Contenido de la página (main en layout ya tiene los márgenes) */}
      <div>{children}</div>
    </SessionProvider>
  );
}
