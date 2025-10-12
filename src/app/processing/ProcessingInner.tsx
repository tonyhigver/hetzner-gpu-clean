"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProcessingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // 🔹 Intentar obtener el correo del usuario logeado (NextAuth)
  const userEmail =
    session?.user?.email ||
    searchParams.get("userEmail") ||
    "usuario@desconocido.com";

  // 🔹 Parámetros pasados desde CreateServerContent
  const serverType = searchParams.get("serverType") || "CX32";
  const gpuType = searchParams.get("gpuType") || "NVIDIA RTX 3060";
  const osImage = searchParams.get("osImage") || "ubuntu-22.04";

  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Creando tu servidor...");

  useEffect(() => {
    async function createServer() {
      try {
        // 🔍 Log de depuración en el navegador
        console.log("📡 Enviando solicitud al backend con:", {
          userEmail,
          serverType,
          gpuType,
          osImage,
        });

        // ⚙️ Importante: apunta directamente al backend Node.js
        const res = await fetch("http://localhost:4000/api/create-user-server", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail, // ✅ el correo del usuario
            serverType,
            gpuType,
            osImage,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Error al crear el servidor");
        }

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
  }, [router, userEmail, serverType, gpuType, osImage]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white text-center p-6">
      {status === "loading" ? (
        <>
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Procesando tu servidor...</h1>
          <p className="text-gray-400">{message}</p>
        </>
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <XCircle className="w-12 h-12 text-red-500" />
          <h1 className="text-3xl font-bold">Error al crear el servidor</h1>
          <p className="text-red-400">{message}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}
