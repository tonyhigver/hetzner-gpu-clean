"use client";
export const dynamic = "force-dynamic"; // 🔹 Evita prerender

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const serverId = searchParams.get("serverId");
  const [serverData, setServerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serverId) return;

    let pollingInterval: number | undefined;

    async function fetchServer() {
      try {
        const res = await fetch(
          `https://157.180.118.67:4000/api/get-server-status?serverId=${serverId}`
        );
        const data = await res.json();
        setServerData(data);

        if (data.status === "running") {
          setLoading(false);
          if (pollingInterval) window.clearInterval(pollingInterval);
        } else {
          setLoading(true);
        }
      } catch (err: any) {
        console.error("❌ Error cargando servidor:", err);
        setError(err.message || "Error desconocido");
        setLoading(false);
        if (pollingInterval) window.clearInterval(pollingInterval);
      }
    }

    // Fetch inicial
    fetchServer();

    // Polling cada 5 segundos
    pollingInterval = window.setInterval(fetchServer, 5000);

    return () => {
      if (pollingInterval) window.clearInterval(pollingInterval);
    };
  }, [serverId]);

  if (!serverId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-2xl">
        ⚠️ No se ha seleccionado ningún servidor
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-2xl">
        🔄 Cargando estado del servidor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 text-2xl">
        ❌ Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Panel del Servidor</h1>

      <div className="bg-gray-800 p-6 rounded-lg space-y-4">
        <p>
          <strong>🆔 ID Hetzner:</strong> {serverData.hetzner_server_id}
        </p>
        <p>
          <strong>💻 Tipo:</strong> {serverData.server_type}
        </p>
        <p>
          <strong>🎮 GPU:</strong> {serverData.gpu_type}
        </p>
        <p>
          <strong>🌐 IP Pública:</strong> {serverData.ip}
        </p>
        <p>
          <strong>📡 Estado:</strong> {serverData.status}
        </p>
      </div>
    </div>
  );
}
