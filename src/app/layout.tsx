import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-black text-white">
        {/* ✅ El HeaderWrapper ya incluye Header y SessionProvider */}
        <HeaderWrapper>
          {/* ✅ Contenedor principal alineado y con padding superior para no tapar contenido */}
          <main className="pt-24 px-12 max-w-6xl mx-auto">
            {children}
          </main>
        </HeaderWrapper>
      </body>
    </html>
  );
}
