"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface ServerData {
  hetzner_server_id: string;
  server_type: string;
  gpu_type: string;
  ip?: string;
  status: string;
}

export default function ServerPage() {
  const searchParams = useSearchParams();
  const serverId = searchParams.get("serverId");
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serverId) return;

    let polling: number;

    const fetchServer = async () => {
      try {
        const res = await fetch(`/api/proxy/get-server-status?serverId=${serverId}`);
        const data: ServerData = await res.json();
        setServerData(data);

        if (data.status === "running") {
          setLoading(false);
          clearInterval(polling);
        } else {
          setLoading(true);
        }
      } catch (err) {
        console.error("Error fetching server status:", err);
      }
    };

    fetchServer();
    polling = window.setInterval(fetchServer, 5000);

    return () => clearInterval(polling);
  }, [serverId]);

  if (!serverId)
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-2xl">
        ⚠️ Servidor no especificado
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">
        {serverData?.server_type || "Servidor"} - ID {serverData?.hetzner_server_id}
      </h1>

      {/* Barra de progreso */}
      <div className="w-full max-w-md bg-gray-700 rounded-full h-6 overflow-hidden mb-2">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{
            width:
              serverData?.status === "running"
                ? "100%"
                : serverData?.status === "creating"
                ? "50%"
                : "10%",
          }}
        />
      </div>

      <p className="mt-2">
        Estado: <strong>{serverData?.status || "Cargando..."}</strong>
      </p>
    </div>
  );
}
