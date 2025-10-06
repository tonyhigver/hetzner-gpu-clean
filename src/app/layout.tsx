import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-black text-white">
        {/* HeaderWrapper incluye Header y SessionProvider */}
        <HeaderWrapper>
          {/* Main con padding superior suficiente para que el contenido quede debajo del header */}
          <main className="pt-28 px-12 max-w-6xl mx-auto">
            {children}
          </main>
        </HeaderWrapper>
      </body>
    </html>
  );
}
