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
        {/* HeaderWrapper maneja el header y el espaciado */}
        <HeaderWrapper>
          {children}
        </HeaderWrapper>
      </body>
    </html>
  );
}
