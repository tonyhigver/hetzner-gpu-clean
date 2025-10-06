import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-black text-white">
        <HeaderWrapper>
          {/* Main centrado, sin padding-top: el spacer del HeaderWrapper ya empuja */}
          <main className="px-12 max-w-6xl mx-auto">
            {children}
          </main>
        </HeaderWrapper>
      </body>
    </html>
  );
}
