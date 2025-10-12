"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProcessingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Creando tu servidor...");

  const userId = searchParams.get("userId") || "usuario-actual-id"; 
  const userEmail = searchParams.get("userEmail") || "usuario@ejemplo.com";
  const serverType = searchParams.get("serverType") || "CX32";
  const gpuType = searchParams.get("gpuType") || "NVIDIA RTX 3060";
  const osImage = searchParams.get("osImage") || "ubuntu-22.04";

  useEffect(() => {
    async function createServer() {
      try {
        const res = await fetch("/api/create-user-server", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, userEmail, serverType, gpuType, osImage }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al crear el servidor");

        const serverId = data.hetznerId || data.serverId || data.id;
        if (serverId) {
          setMessage("Servidor creado correctamente. Redirigiendo...");
          setTimeout(() => router.push(`/dashboard?serverId=${serverId}`), 1200);
        } else throw new Error("No se recibió un ID de servidor válido");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Error desconocido al crear el servidor");
      }
    }

    createServer();
  }, [router, userId, userEmail, serverType, gpuType, osImage]);

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
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}
