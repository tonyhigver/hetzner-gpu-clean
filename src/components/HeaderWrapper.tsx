"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Header />
      {/* Contenido con margen superior suficiente para el header fijo */}
      <div className="pt-4">{children}</div>
    </SessionProvider>
  );
}
