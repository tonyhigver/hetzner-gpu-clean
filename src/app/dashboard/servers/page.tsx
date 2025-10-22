"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Server {
  id: string;
  server_name: string;
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
  const router = useRouter();

  /* ────────────────────────────────
     🧹 Limpiar localStorage al cambiar de usuario
  ───────────────────────────────── */
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const storedEmail = localStorage.getItem("lastUserEmail");
      if (storedEmail && storedEmail !== session.user.email) {
        console.log("🧹 Usuario cambiado, limpiando cache local...");
        localStorage.clear();
      }
      localStorage.setItem("lastUserEmail", session.user.email);
    }
  }, [session, status]);

  /* ────────────────────────────────
     📡 Cargar servidores del usuario autenticado
  ───────────────────────────────── */
  useEffect(() => {
    const fetchServers = async () => {
      try {
        if (status !== "authenticated" || !session?.user?.email) {
          setServers([]);
          setLoading(false);
          return;
        }

        const email = session.user.email;
        console.log("🔄 Cargando servidores para:", email);

        const res = await fetch(`/api/get-user-servers?email=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (res.ok) {
          setServers(data.servers || []);
        } else {
          console.error("❌ Error del backend:", data.error);
          setServers([]);
        }
      } catch (err) {
        console.error("[ServersPage] Error al cargar servidores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, [status, session]);

  /* ────────────────────────────────
     ⚙️ Manejar selección de servidor
  ───────────────────────────────── */
  const handleServerClick = (server: Server) => {
    localStorage.removeItem("selectedServer");
    localStorage.setItem("selectedServer", JSON.stringify(server));
    router.push(`/dashboard/servers/${server.id}`);
  };

  /* ────────────────────────────────
     🎨 Renderizado
  ───────────────────────────────── */
  if (loading)
    return <div className="text-center text-gray-400 mt-32">Cargando servidores...</div>;

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
              onClick={() => handleServerClick(server)}
              className="cursor-pointer bg-[#1E1F26] hover:bg-[#2B2D35] transition-colors p-5 rounded-2xl border border-[#00C896]/50 shadow-lg flex justify-between items-center"
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
