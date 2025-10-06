"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Header fijo arriba */}
      <Header />
      {/* Contenido de la página: el padding-top se gestiona en layout */}
      {children}
    </SessionProvider>
  );
}
