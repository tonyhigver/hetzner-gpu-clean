// layout.tsx
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-black text-white">
        <HeaderWrapper>
          {/* Main con padding-top que empuja el contenido debajo del header */}
          <main className="pt-28 px-12 max-w-6xl mx-auto">
            {children}
          </main>
        </HeaderWrapper>
      </body>
    </html>
  );
}
