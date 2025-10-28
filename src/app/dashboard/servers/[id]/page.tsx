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
    console.log("[GPU-DEBUG] useEffect iniciado, ID en URL:", id);

    if (!id) {
      console.warn("[GPU-DEBUG] No hay ID en URL.");
      return;
    }

    const fetchServer = async () => {
      console.log("[GPU-DEBUG] Iniciando fetchServer con ID:", id);

      // 🔹 LocalStorage cache
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("selectedServer");
        console.log("[GPU-DEBUG] Revisando localStorage: ", stored);

        if (stored) {
          try {
            const parsed = JSON.parse(stored) as Server;
            console.log("[GPU-DEBUG] Servidor encontrado en localStorage:", parsed);
            if (String(parsed.id) === String(id)) {
              setServer(parsed);
              setLoading(false);
              console.log("[GPU-DEBUG] Servidor cargado desde localStorage OK ✅");
              return;
            }
          } catch (e) {
            console.error("[GPU-DEBUG] Error al parsear localStorage:", e);
          }
        }
      }

      // 🔹 Supabase fallback
      try {
        console.log("[GPU-DEBUG] No encontrado en cache, buscando en Supabase...");
        const numericId = Number(id);
        const { data, error } = await supabase
          .from("user_servers")
          .select("*")
          .eq("id", numericId)
          .single();

        if (error || !data) {
          console.error("[GPU-DEBUG] Error o sin datos en Supabase:", error);
          setServer(null);
          return;
        }

        console.log("[GPU-DEBUG] Datos recibidos de Supabase:", data);
        const serverData = { ...data, id: String(data.id) };
        setServer(serverData);

        if (typeof window !== "undefined") {
          localStorage.setItem("selectedServer", JSON.stringify(serverData));
          console.log("[GPU-DEBUG] Guardado en localStorage:", serverData);
        }
      } catch (err) {
        console.error("[GPU-DEBUG] Excepción en fetchServer:", err);
        setServer(null);
      } finally {
        setLoading(false);
        console.log("[GPU-DEBUG] fetchServer finalizado ✅");
      }
    };

    fetchServer();
  }, [id]);

  // 🕒 Countdown
  useEffect(() => {
    if (countdown > 0) {
      console.log(`[GPU-DEBUG] Countdown: ${countdown}s restante`);
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ⚡ Encender GPU
  const handlePowerOnGPU = async () => {
    console.log("[GPU-DEBUG] 🔘 handlePowerOnGPU pulsado.");

    if (!server?.gpu_type) {
      alert("No se encontró el tipo de GPU para este servidor.");
      console.error("[GPU-DEBUG] GPU_TYPE no definido en servidor:", server);
      return;
    }

    console.log("[GPU-DEBUG] Preparando activación GPU...");
    console.log("  → GPU_TYPE:", server.gpu_type);
    console.log("  → SERVER:", server);

    setActivating(true);
    setCountdown(30);

    try {
      const payload = {
        name: `gpu-${server.gpu_type?.toLowerCase()}-${Date.now()}`,
        gpuClass: server.gpu_type,
        serverId: server.id,
        serverName: server.server_name,
        ip: server.ip,
        project: server.project,
      };

      console.log("[GPU-DEBUG] Payload a enviar al backend:", payload);

      const backendUrl = "https://allyrogue.site:3001/power-on";
      console.log("[GPU-DEBUG] Enviando POST a:", backendUrl);

      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[GPU-DEBUG] Respuesta recibida del backend:");
      console.log("  → status:", res.status);
      console.log("  → statusText:", res.statusText);

      const text = await res.text();
      console.log("[GPU-DEBUG] Cuerpo de respuesta backend:", text);

      if (!res.ok) {
        throw new Error(`[${res.status}] ${text}`);
      }

      console.log("[GPU-DEBUG] ✅ GPU encendida correctamente (via backend GPU)");
      alert("GPU encendida correctamente ✅");
    } catch (err) {
      console.error("[GPU-DEBUG] ❌ Error encendiendo GPU:", err);
      alert("Error al intentar encender la GPU. Revisa la consola (ver logs con [GPU-DEBUG]).");
    } finally {
      setActivating(false);
      console.log("[GPU-DEBUG] handlePowerOnGPU finalizado 🔚");
    }
  };

  // 🖥️ UI
  if (loading)
    return (
      <div className="text-center text-gray-400 mt-32">
        Cargando detalles del servidor...
      </div>
    );

  if (!server)
    return (
      <div className="text-center text-gray-400 mt-32">
        No se encontró información del servidor con ID: {id}
      </div>
    );

  console.log("[GPU-DEBUG] Renderizando UI con servidor:", server);

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
