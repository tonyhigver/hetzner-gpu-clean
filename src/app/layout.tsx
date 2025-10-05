// ✅ src/app/layout.tsx
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen"> 
        {/* ✅ Ya NO usamos bg-gray-100 aquí, el fondo lo define globals.css */}
        <HeaderWrapper>
          <main className="p-4">
            {children}
          </main>
        </HeaderWrapper>
      </body>
    </html>
  );
}
