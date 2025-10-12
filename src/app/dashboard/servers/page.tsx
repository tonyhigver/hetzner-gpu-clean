"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ServersPage() {
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchServers = async () => {
      try {
        // 🟢 1. Obtener el usuario logueado
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setServers([]);
          setLoading(false);
          return;
        }

        // 🟢 2. Obtener servidores del usuario desde Supabase
        const { data: userServers, error } = await supabase
          .from("user_servers")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;
        if (!userServers || userServers.length === 0) {
          setServers([]);
          setLoading(false);
          return;
        }

        // 🟢 3. Consultar información actual desde Hetzner por ID
        const hetznerServers = await Promise.all(
          userServers.map(async (srv) => {
            try {
              const res = await fetch(
                `https://api.hetzner.cloud/v1/servers/${srv.hetzner_server_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_HETZNER_API_TOKEN_PROJECT1}`,
                  },
                }
              );

              if (!res.ok) throw new Error("No encontrado en Hetzner");
              const { server } = await res.json();

              return {
                id: srv.hetzner_server_id,
                name: server.name,
                gpu: srv.gpu_type || "N/A",
                status: server.status,
              };
            } catch {
              return {
                id: srv.hetzner_server_id,
                name: "Desconocido",
                gpu: srv.gpu_type || "N/A",
                status: "desconectado",
              };
            }
          })
        );

        setServers(hetznerServers);
      } catch (err) {
        console.error("Error al cargar servidores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-400 mt-32">
        Cargando servidores...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#E6E6E6] pt-28 p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-[#00C896] mb-4 text-center">
        SERVERS
      </h1>

      {servers.length === 0 ? (
        <p className="text-center text-gray-400">
          No tienes servidores activos.
        </p>
      ) : (
        <ul className="space-y-4">
          {servers.map((server) => (
            <li
              key={server.id}
              className="bg-[#1E1F26] p-5 rounded-2xl border border-[#00C896]/50 shadow-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-lg">{server.name}</p>
                <p>GPU: {server.gpu}</p>
              </div>
              <div className="text-right">
                <p>
                  Status:{" "}
                  {server.status === "running"
                    ? "🟢 Running"
                    : server.status === "off"
                    ? "🔴 Stopped"
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
