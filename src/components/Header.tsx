"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full bg-black text-white flex items-center justify-between px-6 py-4 shadow-lg sticky top-0 z-50">
      {/* Título izquierda */}
      <div className="text-2xl font-bold">GPU SaaS</div>

      {/* Derecha: avatar + email + salir */}
      <div className="flex items-center gap-4">
        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Iniciar sesión
          </button>
        ) : (
          <>
            {/* Imagen del usuario */}
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="Perfil"
                width={38}
                height={38}
                className="rounded-full border border-gray-500"
              />
            )}

            {/* Correo */}
            <span className="text-sm">{session.user?.email}</span>

            {/* Botón salir */}
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Salir
            </button>
          </>
        )}
      </div>
    </header>
  );
}
