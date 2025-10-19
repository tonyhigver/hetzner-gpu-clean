"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ServerTerminal from "@/components/ServerTerminal";

interface Server {
  id: string;
  server_name: string;
  gpu_type?: string | null;
  ip?: string | null;
  status: string;
  project?: string | null;
  location?: string | null;
}

// Cliente público de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ServerDetailPage() {
  const { id } = useParams();
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchServer = async () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("selectedServer");
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as Server;
            if (String(parsed.id) === String(id)) {
              setServer(parsed);
              setLoading(false);
              return;
            }
          } catch {}
        }
      }

      try {
        const numericId = Number(id);
        const { data, error } = await supabase
          .from("user_servers")
          .select("*")
          .eq("id", numericId)
          .single();

        if (error || !data) {
          setServer(null);
          console.error("[ServerDetailPage] Error al obtener servidor:", error);
          return;
        }

        const serverData = { ...data, id: String(data.id) };
        setServer(serverData);

        if (typeof window !== "undefined") {
          localStorage.setItem("selectedServer", JSON.stringify(serverData));
        }
      } catch (err) {
        console.error("[ServerDetailPage] Excepción al obtener servidor:", err);
        setServer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchServer();
  }, [id]);

  if (loading)
    return <div className="text-center text-gray-400 mt-32">Cargando detalles del servidor...</div>;

  if (!server)
    return (
      <div className="text-center text-gray-400 mt-32">
        No se encontró información del servidor con ID: {id}
      </div>
    );

  return (
    // Ajustamos el padding superior para bajar todo el contenido y evitar el header
    <div className="flex flex-col w-screen h-screen bg-[#0B0C10] text-[#E6E6E6] pt-32">
      {/* Info del servidor */}
      <div className="px-6 py-4 bg-[#0B0C10] z-10">
        <h1 className="text-5xl font-bold text-[#00C896] mb-2">{server.server_name}</h1>
        <div className="text-gray-300 space-y-1">
          <p>Estado: {server.status === "running" ? "🟢 Activo" : "🔴 Apagado"}</p>
          <p>Proyecto: {server.project || "—"}</p>
          <p>GPU: {server.gpu_type || "—"}</p>
          <p>IP: {server.ip || "—"}</p>
          <p>Ubicación: {server.location || "—"}</p>
        </div>
      </div>

      {/* Terminal ocupando todo lo restante */}
      <div className="flex-1 w-full">
        <ServerTerminal serverId={server.id} />
      </div>
    </div>
  );
}
