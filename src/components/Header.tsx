"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 w-full bg-black text-white shadow-md z-50">
      {/* Contenedor interno que alinea con el main */}
      <div className="max-w-6xl mx-auto px-12 h-28 flex items-center justify-between">
        {/* Izquierda: Título */}
        <h1 className="text-3xl font-bold tracking-wide">GPU SaaS</h1>

        {/* Derecha: Avatar + Email + Botón */}
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
