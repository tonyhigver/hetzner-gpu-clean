import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";

export const metadata = {
  title: "GPU SaaS - Panel de Servidores",
  description: "Gestión de servidores GPU en la nube",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-black text-white">
        {/* Contenedor flexible para que el contenido pueda crecer */}
        <div className="flex flex-col min-h-screen">
          <HeaderWrapper>
            {/* Hacer que los children puedan crecer y no se corte el scroll */}
            <main className="flex-1 overflow-visible">
              {children}
            </main>
          </HeaderWrapper>
        </div>
      </body>
    </html>
  );
}
