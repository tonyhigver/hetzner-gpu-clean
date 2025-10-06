"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full bg-black text-white flex items-center justify-between px-12 py-4 shadow-md fixed top-0 left-0 z-50">
      {/* GPU SaaS a la izquierda */}
      <h1 className="text-3xl font-bold tracking-wide">GPU SaaS</h1>

      {/* Derecha: avatar + email + salir */}
      <div className="flex items-center gap-4">
        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Iniciar sesión
          </button>
        ) : (
          <>
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="Perfil"
                width={38}
                height={38}
                className="rounded-full border border-gray-500"
              />
            )}
            <span className="text-sm text-gray-200 font-light">
              {session.user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
            >
              Salir
            </button>
          </>
        )}
      </div>
    </header>
  );
}
