"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProcessingInner() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [status, setStatus] = useState<"loading" | "error" | "unauthenticated" | "ready">("loading");
  const [message, setMessage] = useState("Creando tu servidor...");
  const [serverId, setServerId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(10);

  const intervalRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  // 🔹 Parámetros de la URL
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const serverType = searchParams?.get("serverType") || "CX32";
  const gpuType = searchParams?.get("gpuType") || "NVIDIA RTX 3060";
  const osImage = searchParams?.get("osImage") || "ubuntu-22.04";

  useEffect(() => {
    if (sessionStatus === "loading") return;

    const userEmail = session?.user?.email;
    if (!userEmail) {
      setStatus("unauthenticated");
      setMessage("Debes iniciar sesión con Google para continuar.");
      return;
    }

    async function createServer() {
      try {
        setMessage("Enviando solicitud al backend...");
        const res = await fetch("/api/create-user-server", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail, serverType, gpuType, osImage }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al crear el servidor");

        const newServerId = data.hetznerId;
        if (!newServerId) throw new Error("No se recibió un ID de servidor válido");
        setServerId(newServerId);
        setMessage("Servidor creado correctamente. Esperando que esté listo...");

        // 🔹 Polling hasta que el servidor esté listo
        intervalRef.current = window.setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/get-server-status?serverId=${newServerId}`);
            const statusData = await statusRes.json();

            if (statusData.status === "running") {
              if (intervalRef.current) clearInterval(intervalRef.current);

              // 🔹 Servidor listo, iniciamos contador de 10 segundos
              setStatus("ready");
              setMessage("Servidor listo! Redirigiendo en 10 segundos...");
              setCountdown(10);

              countdownRef.current = window.setInterval(() => {
                setCountdown(prev => {
                  if (prev <= 1) {
                    if (countdownRef.current) clearInterval(countdownRef.current);
                    router.push(`/dashboard?serverId=${newServerId}`);
                    return 0;
                  }
                  return prev - 1;
                });
              }, 1000);

            } else if (statusData.status === "error") {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setStatus("error");
              setMessage("Hubo un error creando tu servidor en Hetzner.");
            } else {
              setMessage(`Servidor aún no está listo (estado: ${statusData.status})...`);
            }
          } catch (err) {
            console.error("❌ Error obteniendo el estado del servidor:", err);
          }
        }, 1000); // polling cada 1 segundo
      } catch (err: any) {
        console.error("❌ Error al crear el servidor:", err);
        setStatus("error");
        setMessage(err.message || "Error desconocido al crear el servidor");
      }
    }

    createServer();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [session, sessionStatus, serverType, gpuType, osImage, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white text-center p-6">
      {status === "loading" ? (
        <>
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Procesando tu servidor...</h1>
          <p className="text-gray-400">{message}</p>
        </>
      ) : status === "ready" ? (
        <>
          <h1 className="text-3xl font-bold mb-2">Servidor listo!</h1>
          <p className="text-gray-400">{message}</p>
          <p className="text-gray-400 text-xl font-mono mt-2">{countdown}s</p>
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
