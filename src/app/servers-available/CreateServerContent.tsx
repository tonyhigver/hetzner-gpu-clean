"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

interface Server {
  id: string;
  title: string;
  cpu: string;
  ram: string;
  price: number;
  specs: string[];
}

interface GPU {
  id: string;
  name: string;
  vram: string;
  architecture: string;
  price: number;
  specs?: string[];
}

export default function CreateServerContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email || null;

  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedGPU, setSelectedGPU] = useState<string | null>(null);
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [serverId, setServerId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      alert("⚠️ Debes iniciar sesión antes de continuar.");
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    setServers([
      {
        id: "1",
        title: "Nimbus I",
        cpu: "2 (Intel/AMD)",
        ram: "4GB",
        price: 4.6,
        specs: ["RAM: 4GB", "SSD: 40GB", "vCPU: 2 (Intel/AMD)", "Tráfico: 20TB", "Precio: 4.6€"],
      },
      {
        id: "2",
        title: "Nimbus II",
        cpu: "4 (Intel/AMD)",
        ram: "8GB",
        price: 7.8,
        specs: ["RAM: 8GB", "SSD: 80GB", "vCPU: 4 (Intel/AMD)", "Tráfico: 20TB", "Precio: 7.8€"],
      },
      {
        id: "3",
        title: "Nimbus III",
        cpu: "8 (Intel/AMD)",
        ram: "16GB",
        price: 12.95,
        specs: ["RAM: 16GB", "SSD: 160GB", "vCPU: 8 (Intel/AMD)", "Tráfico: 20TB", "Precio: 12.95€"],
      },
      {
        id: "4",
        title: "Stratus I",
        cpu: "2 (AMD)",
        ram: "4GB",
        price: 9.4,
        specs: ["RAM: 4GB", "SSD: 80GB", "vCPU: 2 (AMD)", "Tráfico: 20TB", "Precio: 9.4€"],
      },
      {
        id: "5",
        title: "Stratus II",
        cpu: "4 (AMD)",
        ram: "8GB",
        price: 16.5,
        specs: ["RAM: 8GB", "SSD: 160GB", "vCPU: 4 (AMD)", "Tráfico: 20TB", "Precio/h: 0.022€", "Precio: 16.5€"],
      },
      {
        id: "6",
        title: "Stratus III",
        cpu: "8 (AMD)",
        ram: "16GB",
        price: 29.5,
        specs: ["RAM: 16GB", "SSD: 320GB", "vCPU: 8 (AMD)", "Tráfico: 20TB", "Precio/h: 0.0409€", "Precio: 29.5€"],
      },
      {
        id: "7",
        title: "Stratus IV",
        cpu: "12 (AMD)",
        ram: "24GB",
        price: 39.96,
        specs: ["RAM: 24GB", "SSD: 480GB", "vCPU: 12 (AMD)", "Tráfico: 20TB", "Precio/h: 0.055€", "Precio: 39.96€"],
      },
      {
        id: "8",
        title: "Stratus V",
        cpu: "16 (AMD)",
        ram: "32GB",
        price: 54.95,
        specs: ["RAM: 32GB", "SSD: 640GB", "vCPU: 16 (AMD)", "Tráfico: 20TB", "Precio/h: 0.076€", "Precio: 54.95€"],
      },
      {
        id: "9",
        title: "Titan I",
        cpu: "2 (AMD)",
        ram: "8GB",
        price: 18.86,
        specs: ["RAM: 8GB", "SSD: 80GB", "vCPU: 2 (AMD)", "Tráfico: 20TB", "Precio/h: 0.026€", "Precio: 18.86€"],
      },
      {
        id: "10",
        title: "Titan II",
        cpu: "4 (AMD)",
        ram: "16GB",
        price: 34.25,
        specs: ["RAM: 16GB", "SSD: 160GB", "vCPU: 4 (AMD)", "Tráfico: 20TB", "Precio/h: 0.047€", "Precio: 34.25€"],
      },
      {
        id: "11",
        title: "Titan III",
        cpu: "8 (AMD)",
        ram: "32GB",
        price: 67.45,
        specs: ["RAM: 32GB", "SSD: 240GB", "vCPU: 8 (AMD)", "Tráfico: 30TB", "Precio/h: 0.093€", "Precio: 67.45€"],
      },
      {
        id: "12",
        title: "Titan IV",
        cpu: "16 (AMD)",
        ram: "64GB",
        price: 125.29,
        specs: ["RAM: 64GB", "SSD: 360GB", "vCPU: 16 (AMD)", "Tráfico: 40TB", "Precio/h: 0.17€", "Precio: 125.29€"],
      },
      {
        id: "13",
        title: "Titan V",
        cpu: "4 (AMD)",
        ram: "16GB",
        price: 250.58,
        specs: ["RAM: 16GB", "SSD: 160GB", "vCPU: 4 (AMD)", "Tráfico: 20TB", "Precio/h: 0.348€", "Precio: 250.58€"],
      },
    ]);
  }, []);

  const saladGPUs: GPU[] = [
    { id: "1", name: "RTX 2080 (8 GB)", vram: "8 GB", architecture: "Turing", price: 23, specs: ["VRAM: 8 GB", "Arquitectura: Turing"] },
    { id: "2", name: "RTX 3060 (12 GB)", vram: "12 GB", architecture: "Ampere", price: 18.3, specs: ["VRAM: 12 GB", "Arquitectura: Ampere"] },
    { id: "3", name: "RTX 3080 (10 GB)", vram: "10 GB", architecture: "Ampere", price: 27.54, specs: ["VRAM: 10 GB", "Arquitectura: Ampere"] },
    { id: "4", name: "RTX 3090 (24 GB)", vram: "24 GB", architecture: "Ampere", price: 41.31, specs: ["VRAM: 24 GB", "Arquitectura: Ampere"] },
  ];

  const handleSelectServer = (id: string) => setSelectedServer(prev => (prev === id ? null : id));
  const handleSelectGPU = (id: string) => setSelectedGPU(prev => (prev === id ? null : id));
  const toggleInfo = (id: string) => setOpenInfo(prev => (prev === id ? null : id));

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
      setServerId(data.hetznerId || data.serverId || data.id);
    } catch (err: any) {
      console.error("❌ Error al crear el servidor:", err);
      alert(err.message || "Error desconocido al crear el servidor");
      setLoading(false);
    }
  };

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

  if (loading && serverId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white text-center">
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
    <div className="h-screen w-screen bg-gray-900 text-white overflow-y-auto flex flex-col">
      <h1 className="text-5xl font-bold py-10 text-blue-400 text-center">Selecciona tu Servidor y GPU</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-10">
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
              {/* SERVIDOR */}
              <div>
                {server && (
                  <div className="relative w-full">
                    <button
                      onClick={() => handleSelectServer(server.id)}
                      disabled={selectedServer && selectedServer !== server.id}
                      className={`w-full p-4 rounded-xl border-2 text-xl font-bold transition-all duration-300 flex justify-between items-center ${
                        selectedServer === server.id
                          ? "bg-blue-950 border-blue-400 shadow-[0_0_25px_8px_rgba(96,165,250,0.8)] text-blue-300"
                          : selectedServer && selectedServer !== server.id
                          ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-800 border-gray-700 hover:border-blue-400 hover:text-blue-300"
                      }`}
                    >
                      <div>{server.title}</div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleInfo(server.id);
                        }}
                        className="ml-4 px-3 py-1 text-sm rounded-md border border-blue-500 hover:bg-blue-500/20 text-blue-400 shadow-[0_0_10px_2px_rgba(96,165,250,0.5)] transition-all duration-300"
                      >
                        ℹ️ Info
                      </button>
                    </button>

                    <AnimatePresence>
                      {openInfo === server.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                          className="mt-2 overflow-hidden rounded-lg bg-gray-800/70 border border-blue-500/40 p-4 text-sm text-gray-300"
                        >
                          {server.specs.map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* GPU */}
              <div>
                {gpu && (
                  <div className="relative w-full">
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
                      <div className="flex justify-between items-center">
                        <h3 className={`text-lg font-semibold ${selectedGPU === gpu.id ? "text-blue-300" : ""}`}>
                          {gpu.name}
                        </h3>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleInfo(gpu.id);
                          }}
                          className="ml-4 px-2 py-1 text-sm rounded-md border border-blue-500 hover:bg-blue-500/20 text-blue-400 shadow-[0_0_8px_2px_rgba(96,165,250,0.5)] transition-all duration-300"
                        >
                          ℹ️ Info
                        </button>
                      </div>
                      <p className="text-sm text-gray-300">{gpu.vram} • {gpu.architecture}</p>
                      <p className="text-sm text-gray-400">{gpu.price} €/mes</p>
                    </button>

                    <AnimatePresence>
                      {openInfo === gpu.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                          className="mt-2 overflow-hidden rounded-lg bg-gray-800/70 border border-blue-500/40 p-4 text-sm text-gray-300"
                        >
                          {gpu.specs?.map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-20 w-full text-center pb-10">
        <hr className="border-t-4 border-dashed border-gray-600 mb-10 mx-10" />
        <div className="text-2xl font-semibold text-blue-400 mb-8">
          {totalCost > 0
            ? `💰 Total: ${totalCost.toFixed(2)} €/mes`
            : "Selecciona un servidor y una GPU para ver el total"}
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
