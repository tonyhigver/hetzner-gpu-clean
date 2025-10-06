"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full bg-black text-white flex items-center justify-between px-8 py-4 shadow-md sticky top-0 z-50">
      {/* ✅ Izquierda: Título con margen */}
      <h1 className="text-3xl font-bold tracking-wide">GPU SaaS</h1>

      {/* ✅ Derecha: Avatar + Email + Botón */}
      <div className="flex items-center gap-5">
        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Iniciar sesión
          </button>
        ) : (
          <>
            {/* Foto del usuario */}
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="Perfil"
                width={42}
                height={42}
                className="rounded-full border border-gray-400"
              />
            )}

            {/* Correo */}
            <span className="text-sm font-light">
              {session.user?.email}
            </span>

            {/* Botón salir */}
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm"
            >
              Salir
            </button>
          </>
        )}
      </div>
    </header>
  );
}
