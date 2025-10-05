// src/components/HeaderWrapper.tsx
"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {/* Header visible en todas las páginas */}
      <Header />
      {/* Todo el contenido de la página */}
      <div className="pt-4">{children}</div>
    </SessionProvider>
  );
}
