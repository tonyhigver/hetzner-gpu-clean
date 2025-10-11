"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface ServerData {
  hetzner_server_id: string;
  server_type: string;
  gpu_type: string;
  ip?: string;
  location?: string;
  status: "creating" | "running" | "error";
}

export default function ServerPage() {
  const searchParams = useSearchParams();
  const serverId = searchParams.get("serverId"); // ID del servidor recién creado
  const [servers, setServers] = useState<ServerData[]>([]);
  const [countdown, setCountdown] = useState(30);

  // Obtener lista de servidores
  useEffect(() => {
    async function fetchServers() {
      try {
        const res = await fetch("/api/get-servers"); // endpoint que devuelve lista completa
        const data: ServerData[] = await res.json();
        setServers(data);
      } catch (err) {
        console.error("Error fetching servers:", err);
      }
    }

    fetchServers();
  }, []);

  // Contador para activar servidor nuevo
  useEffect(() => {
    if (!serverId) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Marcar el servidor como activo
          setServers((prevServers) =>
            prevServers.map((s) =>
              s.hetzner_server_id === serverId ? { ...s, status: "running" } : s
            )
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [serverId]);

  if (servers.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-2xl">
        Cargando servidores...
      </div>
    );

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-6">Lista de servidores</h1>
      <ul className="space-y-4">
        {servers.map((server) => (
          <li
            key={server.hetzner_server_id}
            className="p-4 border border-gray-700 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{server.server_type}</p>
              <p>GPU: {server.gpu_type}</p>
              <p>IP: {server.ip || "Asignando..."}</p>
              <p>Ubicación: {server.location || "Desconocida"}</p>
            </div>
            <div className="text-right">
              {server.hetzner_server_id === serverId && server.status === "creating" && (
                <p>Activando en: {countdown}s</p>
              )}
              {server.status === "running" && <p className="text-green-400 font-bold">Activo</p>}
              {server.status === "error" && <p className="text-red-500 font-bold">Error</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
