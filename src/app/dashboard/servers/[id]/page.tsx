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
        } else {
          setServer({ ...data, id: String(data.id) });
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
    <div className="min-h-screen bg-[#0B0C10] text-[#E6E6E6] flex flex-col items-center pt-28 p-6">
      <h1 className="text-5xl font-bold text-[#00C896] mb-8">{server.server_name}</h1>

      <div className="text-center text-gray-300 space-y-2 mb-10">
        <p>Estado: {server.status === "running" ? "🟢 Activo" : "🔴 Apagado"}</p>
        <p>Proyecto: {server.project || "—"}</p>
        <p>GPU: {server.gpu_type || "—"}</p>
        <p>IP: {server.ip || "—"}</p>
        <p>Ubicación: {server.location || "—"}</p>
      </div>

      <div className="bg-black text-green-400 font-mono rounded-2xl shadow-lg p-6 w-full max-w-3xl h-[400px]">
        <p className="text-gray-500 mb-2">TERMINAL</p>
        {/* Client Component: solo se ejecuta en el navegador */}
        <ServerTerminal serverId={server.id} />
      </div>
    </div>
  );
}
