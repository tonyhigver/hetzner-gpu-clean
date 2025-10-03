"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      <div className="font-bold text-xl">GPU SaaS</div>
      <div className="flex items-center gap-4">
        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
          >
            Iniciar con Google
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <img
                src={session.user?.image || ""}
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-sm font-medium">{session.user?.email}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Salir
            </button>
          </>
        )}
      </div>
    </header>
  );
}
