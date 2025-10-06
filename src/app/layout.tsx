import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-black text-white">
        {/* HeaderWrapper incluye Header y SessionProvider */}
        <HeaderWrapper>
          {/* Main centrado, sin padding-top extra: el spacer del HeaderWrapper empuja el contenido */}
          <main className="px-12 max-w-6xl mx-auto">
            {children}
          </main>
        </HeaderWrapper>
      </body>
    </html>
  );
}
