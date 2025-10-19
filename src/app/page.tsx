"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Si el usuario ya está autenticado, lo enviamos al Command Center
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard/command-center"); // <- Aquí es la ruta del Command Center
    }
  }, [status, router]);

  // ✅ Mientras se verifica la sesión
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen text-white text-2xl">
        Cargando...
      </div>
    );
  }

  // ✅ Si NO está logueado → mostrar solo el botón de login
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-4xl font-bold text-white">GPU SaaS</h1>
      <button
        onClick={() => signIn("google")}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Iniciar sesión con Google
      </button>
    </div>
  );
}
