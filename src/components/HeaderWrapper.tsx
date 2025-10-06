"use client";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Header />
      {children} {/* el main ya tiene pt-28 */}
    </SessionProvider>
  );
}
