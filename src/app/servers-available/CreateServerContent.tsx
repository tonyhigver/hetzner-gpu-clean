"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Server {
  id: string;
  title: string;
  cpu: string;
  ram: string;
  price: number;
}

interface GPU {
  id: string;
  name: string;
  vram: string;
  architecture: string;
  price: number;
}

export default function CreateServerContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email || null;

  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedGPU, setSelectedGPU] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [serverId, setServerId] = useState<string | null>(null);

  // 🔒 Redirigir si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      alert("⚠️ Debes iniciar sesión antes de continuar.");
      router.push("/");
    }
  }, [status, router]);

  // 🚀 Cargar lista de servidores personalizados
  useEffect(() => {
    setServers([
      { id: "1", title: "Nimbus I", cpu: "4 vCPU", ram: "8GB", price: 20 },
      { id: "2", title: "Nimbus II", cpu: "8 vCPU", ram: "16GB", price: 35 },
      { id: "3", title: "Nimbus III", cpu: "16 vCPU", ram: "32GB", price: 60 },
      { id: "4", title: "Stratus I", cpu: "8 vCPU", ram: "32GB", price: 45 },
      { id: "5", title: "Stratus II", cpu: "16 vCPU", ram: "64GB", price: 70 },
      { id: "6", title: "Stratus III", cpu: "24 vCPU", ram: "96GB", price: 95 },
      { id: "7", title: "Stratus IV", cpu: "32 vCPU", ram: "128GB", price: 130 },
      { id: "8", title: "Stratus V", cpu: "48 vCPU", ram: "192GB", price: 160 },
      { id: "9", title: "Titan I", cpu: "32 vCPU", ram: "128GB", price: 180 },
      { id: "10", title: "Titan II", cpu: "48 vCPU", ram: "192GB", price: 210 },
      { id: "11", title: "Titan III", cpu: "64 vCPU", ram: "256GB", price: 250 },
      { id: "12", title: "Titan IV", cpu: "72 vCPU", ram: "384GB", price: 290 },
      { id: "13", title: "Titan V", cpu: "96 vCPU", ram: "512GB", price: 350 },
    ]);
  }, []);

  const saladGPUs: GPU[] = [
    { id: "1", name: "NVIDIA RTX 3060", vram: "12 GB", architecture: "Ampere", price: 40 },
    { id: "2", name: "NVIDIA RTX 3070", vram: "8 GB", architecture: "Ampere", price: 55 },
    { id: "3", name: "NVIDIA RTX 3080", vram: "10 GB", architecture: "Ampere", price: 70 },
    { id: "4", name: "NVIDIA RTX 3090", vram: "24 GB", architecture: "Ampere", price: 90 },
    { id: "5", name: "NVIDIA RTX 4070", vram: "12 GB", architecture: "Ada Lovelace", price: 80 },
    { id: "6", name: "NVIDIA RTX 4080", vram: "16 GB", architecture: "Ada Lovelace", price: 100 },
    { id: "7", name: "NVIDIA RTX 4090", vram: "24 GB", architecture: "Ada Lovelace", price: 130 },
    { id: "8", name: "NVIDIA A100", vram: "80 GB", architecture: "Ampere", price: 200 },
    { id: "9", name: "NVIDIA H100", vram: "80 GB", architecture: "Hopper", price: 250 },
  ];

  const handleSelectServer = (id: string) => setSelectedServer(prev => (prev === id ? null : id));
  const handleSelectGPU = (id: string) => setSelectedGPU(prev => (prev === id ? null : id));

  const selectedServerObj = servers.find(s => s.id === selectedServer);
  const selectedGPUObj = saladGPUs.find(g => g.id === selectedGPU);
  const totalCost = (selectedServerObj?.price || 0) + (selectedGPUObj?.price || 0);

  const handleContinue = async () => {
    if (!selectedServer) return alert("Por favor selecciona un servidor.");
    if (!userEmail) return alert("⚠️ Espera a que la sesión cargue correctamente o inicia sesión.");

    setLoading(true);
    const payload = {
      userEmail,
      serverType: selectedServerObj?.title || "",
      gpuType: selectedGPUObj?.name || "",
      osImage: "ubuntu-22.04",
    };

    try {
      const res = await fetch("/api/create-user-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear el servidor");

      const newServerId = data.hetznerId || data.serverId || data.id;
      setServerId(newServerId);
    } catch (err: any) {
      console.error("❌ Error al crear el servidor:", err);
      alert(err.message || "Error desconocido al crear el servidor");
      setLoading(false);
    }
  };

  // ⏳ Cuenta regresiva
  useEffect(() => {
    if (loading && serverId) {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push(`/dashboard/command-center`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loading, serverId, router]);

  // 🧠 Pantalla de carga
  if (loading && serverId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white text-center">
        <h1 className="text-4xl font-bold text-blue-400 mb-4">Creando tu servidor...</h1>
        <p className="text-2xl mb-6">Tu servidor estará listo en {countdown} segundos ⏳</p>
        <div className="w-64 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-1000"
            style={{ width: `${((10 - countdown) / 10) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  const maxRows = Math.max(servers.length, saladGPUs.length);

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center py-10 px-6">
      <h1 className="text-5xl font-bold mb-8 text-blue-400 text-center">
        Selecciona tu Servidor y GPU
      </h1>

      <div className="grid grid-cols-2 gap-8 w-full max-w-7xl">
        {/* 🔹 Columnas principales */}
        <div className="text-center text-2xl font-semibold text-green-400 border-b border-gray-700 pb-3">
          Servidores Hetzner
        </div>
        <div className="text-center text-2xl font-semibold text-blue-400 border-b border-gray-700 pb-3">
          GPUs disponibles (Salad)
        </div>

        {Array.from({ length: maxRows }).map((_, index) => {
          const server = servers[index];
          const gpu = saladGPUs[index];
          return (
            <React.Fragment key={index}>
              {/* 🔸 Servidores */}
              <div>
                {server && (
                  <button
                    onClick={() => handleSelectServer(server.id)}
                    disabled={selectedServer && selectedServer !== server.id}
                    className={`w-full p-4 rounded-xl border-2 text-xl font-bold transition-all duration-300 flex flex-col items-center justify-center ${
                      selectedServer === server.id
                        ? "bg-blue-950 border-blue-400 shadow-[0_0_25px_8px_rgba(96,165,250,0.8)] text-blue-300"
                        : selectedServer && selectedServer !== server.id
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 border-gray-700 hover:border-blue-400 hover:text-blue-300"
                    }`}
                  >
                    <div>{server.title}</div>
                    <div className="text-sm text-gray-400 mt-1 animate-pulse">
                      info ↓
                    </div>
                  </button>
                )}
              </div>

              {/* 🔹 GPUs */}
              <div>
                {gpu && (
                  <button
                    onClick={() => handleSelectGPU(gpu.id)}
                    disabled={selectedGPU && selectedGPU !== gpu.id}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                      selectedGPU === gpu.id
                        ? "bg-blue-950 border-blue-400 shadow-[0_0_30px_10px_rgba(30,64,175,0.9)] text-blue-300"
                        : selectedGPU && selectedGPU !== gpu.id
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 border-gray-700 hover:border-blue-400"
                    }`}
                  >
                    <h3 className={`text-lg font-semibold ${selectedGPU === gpu.id ? "text-blue-300" : ""}`}>
                      {gpu.name}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {gpu.vram} • {gpu.architecture}
                    </p>
                    <p className="text-sm text-gray-400">{gpu.price} €/mes</p>
                  </button>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* 💰 Total y botones */}
      <div className="mt-20 w-full max-w-4xl text-center">
        <hr className="border-t-4 border-dashed border-gray-600 mb-10" />
        <div className="text-2xl font-semibold text-blue-400 mb-8">
          {totalCost > 0 ? `💰 Total: ${totalCost} €/mes` : "Selecciona un servidor y una GPU para ver el total"}
        </div>
        <div className="flex justify-center gap-6">
          <button
            onClick={handleContinue}
            disabled={!selectedServer || !userEmail}
            className={`px-10 py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
              selectedServer && userEmail
                ? "bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_4px_rgba(96,165,250,0.8)] text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            ✅ Aceptar y continuar
          </button>

          <button
            onClick={() => router.push("/dashboard/command-center")}
            className="px-8 py-3 text-lg font-semibold rounded-xl bg-gray-700 hover:bg-gray-600 transition-all duration-300"
          >
            🔙 Volver al Command Center
          </button>
        </div>
      </div>
    </div>
  );
}
