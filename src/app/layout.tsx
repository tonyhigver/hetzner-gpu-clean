// ✅ src/app/layout.tsx
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-black text-white"> 
        {/* ✅ Fondo negro aplicado aquí */}
        <HeaderWrapper>
          {/* ✅ Añadimos padding top para que el contenido no quede tapado por el Header */}
          <main className="pt-20 px-6">
            {children}
          </main>
        </HeaderWrapper>
      </body>
    </html>
  );
}
