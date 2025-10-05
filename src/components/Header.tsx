"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between p-4 bg-black text-white shadow-md sticky top-0 z-50">
      <div className="font-bold text-xl">GPU SaaS</div>

      <div className="flex items-center gap-4">
        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Iniciar con Google
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <span className="text-sm">{session.user?.email}</span>
            </div>
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
