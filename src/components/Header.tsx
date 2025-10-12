"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // 🔹 Detectamos si estamos en el Dashboard
  const isDashboard = pathname?.startsWith("/dashboard");

  // 🔸 Si estamos en el Dashboard, mostrar recuadro flotante
  if (isDashboard) {
    return (
      <div className="fixed top-6 right-6 z-50 bg-gray-900/95 border border-gray-700 rounded-2xl p-3 shadow-lg flex items-center gap-3">
        {session?.user?.image && (
          <Image
            src={session.user.image}
            alt="Perfil"
            width={40}
            height={40}
            className="rounded-full border border-gray-600"
          />
        )}
        <button
          onClick={() => signOut()}
          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
        >
          Salir
        </button>
      </div>
    );
  }

  // 🔸 Para el resto de páginas, mantener el header tradicional
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
