"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith("/dashboard");

  // Opciones del menú del dashboard
  const menuItems = [
    "SERVERS",
    "VOLUMES",
    "FLOATING IP",
    "FIREWALLS",
    "LOAD BALANCERS",
    "NETWORKS",
    "DNS",
    "OBJECT STORAGE",
    "STORAGE BOXES",
    "SECURITY",
  ];

  // 🟢 Si estamos en el dashboard:
  if (isDashboard) {
    return (
      <>
        {/* 🔹 Recuadro flotante con la imagen y botón salir */}
        <div className="fixed top-6 right-6 z-50 bg-[#1E1F26]/95 border border-[#00C896] rounded-2xl p-3 shadow-lg flex items-center gap-3 backdrop-blur-md">
          {session?.user?.image && (
            <Image
              src={session.user.image}
              alt="Perfil"
              width={40}
              height={40}
              className="rounded-full border border-[#00C896]"
            />
          )}
          <button
            onClick={() => signOut()}
            className="bg-[#FF5252] text-white px-3 py-1 rounded-md hover:bg-[#ff6666] transition text-sm font-semibold"
          >
            Salir
          </button>
        </div>

        {/* 🔹 Barra de navegación superior */}
        <nav className="fixed top-0 left-0 w-full bg-[#0B0C10] border-b border-[#1E1F26] text-[#E6E6E6] flex overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-[#00C896]/60 scrollbar-track-transparent z-40">
          <div className="flex items-center space-x-6 px-6 py-3 min-w-max">
            {menuItems.map((item) => (
              <button
                key={item}
                className="text-sm font-medium hover:text-[#00C896] transition-colors"
                onClick={() => console.log(`Redirigir a ${item}`)}
              >
                {item}
              </button>
            ))}
          </div>
        </nav>
      </>
    );
  }

  // 🔸 Para el resto de páginas, mantener el header normal
  return (
    <header className="fixed top-0 left-0 w-full bg-black text-white shadow-md z-50 h-24">
      <div className="max-w-6xl mx-auto px-12 h-full flex items-center justify-end pt-2">
        <div className="flex items-center gap-4">
          {!session ? (
            <button
              onClick={() => signIn("google")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Iniciar sesión
            </button>
          ) : (
            <>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Perfil"
                  width={40}
                  height={40}
                  className="rounded-full border border-gray-500"
                />
              )}
              <span className="text-sm text-gray-200">{session.user?.email}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
              >
                Salir
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
