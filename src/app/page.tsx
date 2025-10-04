"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Si el usuario ya está autenticado, lo enviamos a /servers-available
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/servers-available");
    }
  }, [status, router]);

  // ✅ Mientras se verifica la sesión
  if (status === "loading") {
    return <p>Cargando...</p>;
  }

  // ✅ Si NO está logueado → mostrar solo el botón de login
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column"
    }}>
      <h1>GPU SaaS</h1>
      <button
        onClick={() => signIn("google")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4285F4",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        Iniciar sesión con Google
      </button>
    </div>
  );
}
