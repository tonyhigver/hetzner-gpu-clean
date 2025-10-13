"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Server {
  id: string;
  name: string;
  type: string;
  gpu: string;
  ip: string;
  status: string;
}

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchServers = async () => {
      try {
        // 🔹 Obtener el usuario autenticado
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.email) {
          setServers([]);
          setLoading(false);
          return;
        }

        // 🔹 Obtener los servidores del usuario desde Supabase usando email
        const { data: userServers, error } = await supabase
          .from("user_servers")
          .select("*")
          .eq("user_id", user.email);

        if (error) throw error;
        if (!userServers || userServers.length === 0) {
          setServers([]);
          setLoading(false);
          return;
        }

        // 🔹 Consultar Hetzner por cada hetzner_server_id para obtener nombre, IP y estado
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
                type: srv.server_type || server.server_type?.name || "Desconocido",
                gpu: srv.gpu_type || "N/A",
                ip: server.public_net?.ipv4?.ip || srv.ip || "No asignada",
                status: server.status,
              };
            } catch {
              return {
                id: srv.hetzner_server_id,
                name: "Desconocido",
                type: srv.server_type || "Desconocido",
                gpu: srv.gpu_type || "N/A",
                ip: srv.ip || "No asignada",
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
  }, [supabase]);

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
                <p className="font-semibold text-lg">{server.name}</p>
                <p>Tipo: {server.type}</p>
                <p>GPU: {server.gpu}</p>
                <p>IP: {server.ip}</p>
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
