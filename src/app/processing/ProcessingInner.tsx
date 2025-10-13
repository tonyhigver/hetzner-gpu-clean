"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProcessingInner() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [status, setStatus] = useState<"loading" | "error" | "unauthenticated">("loading");
  const [message, setMessage] = useState("Creando tu servidor...");

  // 🔹 Parámetros de la URL
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const serverType = searchParams?.get("serverType") || "CX32";
  const gpuType = searchParams?.get("gpuType") || "NVIDIA RTX 3060";
  const osImage = searchParams?.get("osImage") || "ubuntu-22.04";

  useEffect(() => {
    // 🔹 Mostramos el estado de la sesión y el objeto completo
    console.log("🔍 sessionStatus:", sessionStatus);
    console.log("🔍 session object:", session);

    // 🔹 Email del usuario desde la sesión
    const userEmail = session?.user?.email || null;
    console.log("🔍 userEmail:", userEmail); // ← Aquí verás el correo del usuario

    if (sessionStatus === "loading") return;

    if (!userEmail) {
      setStatus("unauthenticated");
      setMessage("Debes iniciar sesión con Google para continuar.");
      return;
    }

    async function createServer() {
      try {
        console.log("📡 Enviando solicitud al backend con:", {
          userEmail,
          serverType,
          gpuType,
          osImage,
        });

        const res = await fetch("/api/create-user-server", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail, serverType, gpuType, osImage }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al crear el servidor");

        const serverId = data.hetznerId || data.serverId || data.id;
        if (serverId) {
          console.log(`✅ Servidor creado correctamente: ${serverId}`);
          setMessage("Servidor creado correctamente. Redirigiendo...");
          setTimeout(() => router.push(`/dashboard?serverId=${serverId}`), 1500);
        } else {
          throw new Error("No se recibió un ID de servidor válido");
        }
      } catch (err: any) {
        console.error("❌ Error al crear el servidor:", err);
        setStatus("error");
        setMessage(err.message || "Error desconocido al crear el servidor");
      }
    }

    createServer();
  }, [session, sessionStatus, serverType, gpuType, osImage, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white text-center p-6">
      {status === "loading" ? (
        <>
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Procesando tu servidor...</h1>
          <p className="text-gray-400">{message}</p>
        </>
      ) : status === "unauthenticated" ? (
        <div className="flex flex-col items-center space-y-3">
          <XCircle className="w-12 h-12 text-red-500" />
          <h1 className="text-3xl font-bold">No estás autenticado</h1>
          <p className="text-red-400">{message}</p>
          <Button onClick={() => router.push("/")} variant="outline" className="mt-4">
            Iniciar sesión
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <XCircle className="w-12 h-12 text-red-500" />
          <h1 className="text-3xl font-bold">Error al crear el servidor</h1>
          <p className="text-red-400">{message}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}
