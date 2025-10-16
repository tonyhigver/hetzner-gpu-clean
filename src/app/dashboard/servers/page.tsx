"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Server {
  id: string;
  server_name: string;
  status: string;
  project?: string;
}

export default function ServersPage() {
  const { data: session, status } = useSession();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      setServers([]);
      setLoading(false);
      return;
    }

    const fetchServers = async () => {
      try {
        const email = session.user.email;
        const res = await fetch(
          `/api/get-user-servers?email=${encodeURIComponent(email)}`
        );
        if (!res.ok) throw new Error("Error al obtener servidores");

        const data = await res.json();

        // 🔹 Filtrar servidores visibles (excluyendo backend-master)
        const visibleServers = (data.servers || []).filter(
          (srv: any) => srv.server_name !== "backend-master"
        );

        setServers(visibleServers);
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
      <h1 className="text-3xl font-bold text-[#00C896] mb-4 text-center">
        MIS SERVIDORES
      </h1>

      {servers.length === 0 ? (
        <p className="text-center text-gray-400">
          No tienes servidores activos (o todos fueron filtrados).
        </p>
      ) : (
        <ul className="space-y-4">
          {servers.map((server) => (
            <li
              key={server.id}
              className="bg-[#1E1F26] p-5 rounded-2xl border border-[#00C896]/50 shadow-lg flex justify-between items-center"
            >
              <p className="font-semibold text-xl text-[#00C896]">
                {server.server_name}
              </p>
              <p>
                {server.status === "running"
                  ? "🟢 Activo"
                  : server.status === "off"
                  ? "🔴 Apagado"
                  : "🟠 Desconocido"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
