"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // 🔹 Detectamos si estamos en el Dashboard
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-black text-white shadow-md z-50 ${
        isDashboard ? "h-14" : "h-24"
      }`}
    >
      <div
        className={`max-w-6xl mx-auto ${
          isDashboard ? "px-6" : "px-12"
        } h-full flex items-center justify-end ${
          isDashboard ? "" : "pt-2"
        }`}
      >
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
                  width={isDashboard ? 36 : 40}
                  height={isDashboard ? 36 : 40}
                  className="rounded-full border border-gray-500"
                />
              )}

              {/* 🔹 Si NO estamos en el Dashboard, mostrar Gmail */}
              {!isDashboard && (
                <span className="text-sm text-gray-200">{session.user?.email}</span>
              )}

              <button
                onClick={() => signOut()}
                className={`${
                  isDashboard
                    ? "bg-red-600 text-white px-3 py-1 text-sm"
                    : "bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
                } rounded-md hover:bg-red-700 transition`}
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
