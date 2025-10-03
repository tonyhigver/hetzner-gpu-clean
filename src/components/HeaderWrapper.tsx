// src/components/HeaderWrapper.tsx
"use client"; // ✅ obligatorio para Client Component
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Header /> {/* Header con login/logout y avatar */}
      {children} {/* Aquí va el contenido de cada página */}
    </SessionProvider>
  );
}
