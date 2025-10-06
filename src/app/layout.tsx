// ✅ src/app/layout.tsx
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-black text-white">
        {/* ✅ El Header siempre está antes del contenido */}
        <HeaderWrapper />
        
        {/* ✅ Contenido debajo del header con margen y centrado */}
        <main className="pt-24 px-6 max-w-6xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
