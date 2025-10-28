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

// 🟩 Cliente Supabase
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

  // 🧠 Fetch de servidor
  useEffect(() => {
    if (!id) {
      console.warn("[ServerDetailPage] No hay ID en URL.");
      return;
    }

    const fetchServer = async () => {
      console.log("[ServerDetailPage] Iniciando fetchServer para ID:", id);

      // LocalStorage cache
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("selectedServer");
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as Server;
            console.log("[ServerDetailPage] Encontrado en localStorage:", parsed);
            if (String(parsed.id) === String(id)) {
              setServer(parsed);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("[ServerDetailPage] Error al parsear localStorage:", e);
          }
        }
      }

      // Supabase fallback
      try {
        console.log("[ServerDetailPage] Buscando en Supabase...");
        const numericId = Number(id);
        const { data, error } = await supabase
          .from("user_servers")
          .select("*")
          .eq("id", numericId)
          .single();

        if (error || !data) {
          console.error("[ServerDetailPage] Error desde Supabase:", error);
          setServer(null);
          return;
        }

        console.log("[ServerDetailPage] Datos de Supabase:", data);
        const serverData = { ...data, id: String(data.id) };
        setServer(serverData);

        if (typeof window !== "undefined") {
          localStorage.setItem("selectedServer", JSON.stringify(serverData));
          console.log("[ServerDetailPage] Guardado en localStorage.");
        }
      } catch (err) {
        console.error("[ServerDetailPage] Excepción al obtener servidor:", err);
        setServer(null);
      } finally {
        setLoading(false);
        console.log("[ServerDetailPage] fetchServer finalizado.");
      }
    };

    fetchServer();
  }, [id]);

  // 🕒 Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ⚡ Encender GPU (MODIFICADO)
  const handlePowerOnGPU = async () => {
    console.log("[ServerDetailPage] handlePowerOnGPU pulsado.");

    if (!server?.gpu_type) {
      alert("No se encontró el tipo de GPU para este servidor.");
      console.error("[ServerDetailPage] GPU_TYPE no definido en servidor:", server);
      return;
    }

    console.log("[ServerDetailPage] Preparando activación GPU...");
    console.log("  GPU_TYPE:", server.gpu_type);
    console.log("  SERVER:", server);

    setActivating(true);
    setCountdown(30);

    try {
      // 🔹 Datos que se enviarán al backend
      const payload = {
        server_name: server.server_name,
        gpu_type: server.gpu_type,
      };

      console.log("[ServerDetailPage] Payload enviado al backend:", payload);

      // 🚀 Enviar petición al backend real (no a /api local)
      const res = await fetch("http://localhost:4000/power-on-gpu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[ServerDetailPage] Respuesta HTTP backend:", res.status, res.statusText);
      const text = await res.text();
      console.log("[ServerDetailPage] Cuerpo de respuesta:", text);

      if (!res.ok) {
        throw new Error(`[${res.status}] ${text}`);
      }

      console.log("✅ GPU encendida correctamente (via backend)");
      alert("GPU encendida correctamente ✅");
    } catch (err) {
      console.error("❌ Error encendiendo GPU:", err);
      alert("Error al intentar encender la GPU. Revisa la consola (ver logs con [ServerDetailPage]).");
    } finally {
      setActivating(false);
      console.log("[ServerDetailPage] handlePowerOnGPU completado.");
    }
  };

  // 🖥️ UI
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
      {/* ENCABEZADO */}
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

        {/* BOTÓN ENCENDER */}
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

      {/* TERMINAL */}
      <div className="flex-1 w-full">
        <ServerTerminal serverId={server.id} />
      </div>
    </div>
  );
}