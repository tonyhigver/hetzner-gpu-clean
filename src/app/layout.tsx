// src/app/layout.tsx
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 min-h-screen">
        <SessionProvider>
          <Header /> {/* ✅ Header visible en todas las páginas */}
          <main className="p-4" suppressHydrationWarning>
            {children} {/* contenido de cada página */}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
