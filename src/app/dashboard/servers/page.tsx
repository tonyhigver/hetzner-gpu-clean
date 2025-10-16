"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Server {
  id: string;
  server_name: string; // ✅ este es el campo real que devuelve Supabase
  gpu_type?: string | null;
  ip?: string | null;
  status: string;
  project?: string | null;
  location?: string | null;
}

export default function ServersPage() {
  const { data: session, status } = useSession();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[ServersPage] useEffect ejecutado, status:", status, "session:", session);

    if (status === "loading") return;

    if (!session?.user?.email) {
      console.log("[ServersPage] No hay email de usuario, no se pueden cargar servidores");
      setServers([]);
      setLoading(false);
      return;
    }

    const fetchServers = async () => {
      try {
        const email = session.user.email;
        console.log("[ServersPage] Solicitando servidores para:", email);

        const res = await fetch(`/api/get-user-servers?email=${encodeURIComponent(email)}`);
        console.log("[ServersPage] Response status:", res.status);

        if (!res.ok) {
          console.error("[ServersPage] Error en fetch:", res.status, await res.text());
          throw new Error("Error al obtener servidores");
        }

        const data = await res.json();
        console.log("[ServersPage] Datos recibidos:", data);

        setServers(data.servers || []);
      } catch (err) {
        console.error("[ServersPage] Error al cargar servidores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, [session, status]);

  if (loading) {
    return (
      <div className="text-center text-gray-400 mt-32">
        Cargando servidores...
      </div>
    );
  }

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <h2 className="text-2xl font-bold mb-4">No has iniciado sesión</h2>
        <p className="text-gray-400">
          Por favor, inicia sesión para ver tus servidores.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#E6E6E6] pt-28 p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-[#00C896] mb-6 text-center">
        MIS SERVIDORES
      </h1>

      {servers.length === 0 ? (
        <p className="text-center text-gray-400">
          No tienes servidores activos en tu cuenta.
        </p>
      ) : (
        <ul className="space-y-4">
          {servers.map((server) => (
            <li
              key={server.id}
              className="bg-[#1E1F26] p-5 rounded-2xl border border-[#00C896]/50 shadow-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-lg">
                  🖥️ {server.server_name || "Servidor sin nombre"}
                </p>
                {server.project && <p>Proyecto: {server.project}</p>}
                {server.location && <p>Ubicación: {server.location}</p>}
                <p>GPU: {server.gpu_type || "—"}</p>
                <p>IP: {server.ip || "—"}</p>
              </div>
              <div className="text-right">
                <p>
                  Estado:{" "}
                  {server.status === "running"
                    ? "🟢 Activo"
                    : server.status === "off"
                    ? "🔴 Apagado"
                    : "🟠 Desconocido"}
                </p>
                <p>ID: {server.id}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
