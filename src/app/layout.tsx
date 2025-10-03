// src/app/layout.tsx
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 min-h-screen">
        <HeaderWrapper>
          <main className="p-4">{children}</main>
        </HeaderWrapper>
      </body>
    </html>
  );
}
