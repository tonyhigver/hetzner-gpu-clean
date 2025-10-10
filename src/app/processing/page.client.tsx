"use client";
export const dynamic = "force-dynamic"; // 🔹 Evita prerender

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProcessingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Creando tu servidor en Hetzner...");
  const [serverInfo, setServerInfo] = useState<any>(null);

  const userId = searchParams.get("userId") || "usuario-actual-id";
  const serverType = searchParams.get("serverType") || "CX32";
  const gpuType = searchParams.get("gpuType") || "NVIDIA RTX 3060";
  const osImage = searchParams.get("osImage") || "ubuntu-22.04";
  const serverIdParam = searchParams.get("serverId");

  useEffect(() => {
    let pollingInterval: number | undefined;

    async function createOrPollServer() {
      try {
        let currentServerId = serverIdParam;

        if (!currentServerId) {
          const res = await fetch(
            "https://157.180.118.67:4000/api/create-user-server",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, serverType, gpuType, osImage }),
            }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Error al crear servidor");
          setServerInfo(data);
          currentServerId = data.hetznerId;
        }

        pollingInterval = window.setInterval(async () => {
          try {
            const statusRes = await fetch(
              `https://157.180.118.67:4000/api/get-server-status?serverId=${currentServerId}`
            );
            const statusData = await statusRes.json();
            const serverStatus = statusData.status;

            if (serverStatus === "running") {
              setStatus("success");
              setMessage("Servidor listo 🚀");
              if (pollingInterval) window.clearInterval(pollingInterval);
              router.push(`/dashboard?serverId=${currentServerId}`);
            } else {
              setStatus("loading");
              setMessage(`Servidor en estado: ${serverStatus}...`);
            }
          } catch (err: any) {
            console.error("❌ Error consultando el estado del servidor:", err);
            setStatus("error");
            setMessage(err.message || "Error desconocido al consultar servidor");
            if (pollingInterval) window.clearInterval(pollingInterval);
          }
        }, 5000);
      } catch (err: any) {
        console.error("❌ Error al crear servidor:", err);
        setStatus("error");
        setMessage(err.message || "Error desconocido al crear servidor");
      }
    }

    createOrPollServer();

    return () => {
      if (pollingInterval) window.clearInterval(pollingInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white text-center p-6">
      {status === "loading" && (
        <>
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Procesando tu servidor...</h1>
          <p className="text-gray-400">{message}</p>
        </>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
          <h1 className="text-3xl font-bold">¡Servidor listo!</h1>
          <p className="text-gray-400">{message}</p>
          <p className="text-gray-500 text-sm mt-2">
            Serás redirigido automáticamente al panel principal...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center space-y-3">
          <XCircle className="w-12 h-12 text-red-500" />
          <h1 className="text-3xl font-bold">Error al procesar el servidor</h1>
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
