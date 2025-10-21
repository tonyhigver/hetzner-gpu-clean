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
  const [countdown, setCountdown] = useState(0);
  const [activating, setActivating] = useState(false);

  // 🔹 Cargar info del servidor
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
          console.error("[ServerDetailPage] Error al obtener servidor:", error);
          setServer(null);
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

  // 🔹 Contador de 30 segundos
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 🔹 Encender GPU
  const handlePowerOnGPU = async () => {
    if (!server?.gpu_type) {
      alert("No se encontró el tipo de GPU para este servidor.");
      return;
    }

    setActivating(true);
    setCountdown(30);

    try {
      // 🔸 Crear container en SaladCloud
      const res = await fetch("https://api.salad.com/api/public/container-groups", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SALAD_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `gpu-${server.gpu_type?.toLowerCase()}-${Date.now()}`,
          container: {
            image: "ubuntu:22.04",
            command: ["bash", "-c", "sleep 60"],
            resources: {
              gpus: 1,
              gpuClasses: [server.gpu_type],
              priority: "batch",
            },
          },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      console.log("✅ GPU encendida correctamente en SaladCloud");
    } catch (err) {
      console.error("❌ Error encendiendo GPU:", err);
      alert("Error al intentar encender la GPU. Revisa la consola.");
    } finally {
      setActivating(false);
    }
  };

  // 🔹 Interfaz
  if (loading)
    return <div className="text-center text-gray-400 mt-32">Cargando detalles del servidor...</div>;

  if (!server)
    return (
      <div className="text-center text-gray-400 mt-32">
        No se encontró información del servidor con ID: {id}
      </div>
    );

  return (
    <div className="flex flex-col w-screen h-screen bg-[#0B0C10] text-[#E6E6E6] pt-32">
      {/* Encabezado con información del servidor */}
      <div className="px-6 py-4 bg-[#0B0C10] flex justify-between items-center z-10">
        <div>
          <h1 className="text-5xl font-bold text-[#00C896] mb-2">{server.server_name}</h1>
          <div className="text-gray-300 space-y-1">
            <p>Estado: {server.status === "running" ? "🟢 Activo" : "🔴 Apagado"}</p>
            <p>Proyecto: {server.project || "—"}</p>
            <p>GPU: {server.gpu_type || "—"}</p>
            <p>IP: {server.ip || "—"}</p>
            <p>Ubicación: {server.location || "—"}</p>
          </div>
        </div>

        {/* 🔹 Botón Encender GPU + contador */}
        <div className="flex items-center gap-4">
          {countdown > 0 && (
            <span className="text-lg text-gray-400 font-mono">{countdown}s</span>
          )}
          <button
            onClick={handlePowerOnGPU}
            disabled={activating || countdown > 0}
            className={`px-5 py-2 rounded-xl font-semibold text-white transition ${
              activating || countdown > 0
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-[#00C896] hover:bg-[#00b184]"
            }`}
          >
            {activating || countdown > 0 ? "Activando..." : "⚡ Encender GPU"}
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 w-full">
        <ServerTerminal serverId={server.id} />
      </div>
    </div>
  );
}
