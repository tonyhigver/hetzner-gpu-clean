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
}

export default function CreateServerContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email || null;

  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const [selectedGPU, setSelectedGPU] = useState<string | null>(null);
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
        specs: ["RAM: 4GB", "SSD: 40GB", "vCPU: 2 (Intel/AMD)", "Tráfico: 20TB", "Precio/h: 0.0064€", "Precio: 4.6€"],
      },
      {
        id: "2",
        title: "Nimbus II",
        cpu: "4 (Intel/AMD)",
        ram: "8GB",
        price: 7.8,
        specs: ["RAM: 8GB", "SSD: 80GB", "vCPU: 4 (Intel/AMD)", "Tráfico: 20TB", "Precio/h: 0.0109€", "Precio: 7.8€"],
      },
      {
        id: "3",
        title: "Nimbus III",
        cpu: "8 (Intel/AMD)",
        ram: "16GB",
        price: 12.95,
        specs: ["RAM: 16GB", "SSD: 160GB", "vCPU: 8 (Intel/AMD)", "Tráfico: 20TB", "Precio/h: 0.0196€", "Precio: 12.95€"],
      },
      {
        id: "4",
        title: "Stratus I",
        cpu: "2 (AMD)",
        ram: "4GB",
        price: 9.4,
        specs: ["RAM: 4GB", "SSD: 80GB", "vCPU: 2 (AMD)", "Tráfico: 20TB", "Precio/h: 0.013€", "Precio: 9.4€"],
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
    { id: "1", name: "RTX 2080 (8 GB)", vram: "8 GB", architecture: "Turing", price: 23 },
    { id: "2", name: "RTX 3050 (8 GB)", vram: "8 GB", architecture: "Ampere", price: 13.7 },
    { id: "3", name: "RTX 3060 (8 GB)", vram: "8 GB", architecture: "Ampere", price: 13.7 },
    { id: "4", name: "RTX 3060 (12 GB)", vram: "12 GB", architecture: "Ampere", price: 18.3 },
    { id: "5", name: "RTX 3070 (8 GB)", vram: "8 GB", architecture: "Ampere", price: 18.3 },
    { id: "6", name: "RTX 3080 (10 GB)", vram: "10 GB", architecture: "Ampere", price: 27.54 },
    { id: "7", name: "RTX 3080 Ti (12 GB)", vram: "12 GB", architecture: "Ampere", price: 36.7 },
    { id: "8", name: "RTX 3090 (24 GB)", vram: "24 GB", architecture: "Ampere", price: 41.31 },
    { id: "9", name: "RTX 3090 Ti (24 GB)", vram: "24 GB", architecture: "Ampere", price: 45.9 },
    { id: "10", name: "RTX 4060 Ti (16 GB)", vram: "16 GB", architecture: "Ada Lovelace", price: 36.7 },
    { id: "11", name: "RTX 4070 (12 GB)", vram: "12 GB", architecture: "Ada Lovelace", price: 36.7 },
    { id: "12", name: "RTX 4070 Ti (12 GB)", vram: "12 GB", architecture: "Ada Lovelace", price: 36.7 },
    { id: "13", name: "RTX 4070 Ti Super (16 GB)", vram: "16 GB", architecture: "Ada Lovelace", price: 50.79 },
    { id: "14", name: "RTX 4080 (16 GB)", vram: "16 GB", architecture: "Ada Lovelace", price: 50.79 },
    { id: "15", name: "RTX 4090 (24 GB)", vram: "24 GB", architecture: "Ada Lovelace", price: 73.44 },
    { id: "16", name: "RTX 5060 Ti (16 GB)", vram: "16 GB", architecture: "Blackwell", price: 31.13 },
    { id: "17", name: "RTX 5070 (12 GB)", vram: "12 GB", architecture: "Blackwell", price: 36.7 },
    { id: "18", name: "RTX 5070 Ti (16 GB)", vram: "16 GB", architecture: "Blackwell", price: 45.9 },
    { id: "19", name: "RTX 5080 (16 GB)", vram: "16 GB", architecture: "Blackwell", price: 82.6 },
    { id: "20", name: "RTX 5090 (32 GB)", vram: "32 GB", architecture: "Blackwell", price: 114.75 },
    { id: "21", name: "L40S (48 GB)", vram: "48 GB", architecture: "Ada Lovelace", price: 147.18 },
    { id: "22", name: "A100 (40 GB PCIe)", vram: "40 GB", architecture: "Ampere", price: 183.6 },
    { id: "23", name: "A100 (80 GB SXM)", vram: "80 GB", architecture: "Ampere", price: 230 },
    { id: "24", name: "H100 NVL (94 GB)", vram: "94 GB", architecture: "Hopper", price: 460 },
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

      const newServerId = data.hetznerId || data.serverId || data.id;
      setServerId(newServerId);
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
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-5xl font-bold mb-8 text-blue-400 text-center"
      >
        Selecciona tu Servidor y GPU
      </motion.h1>

      <div className="grid grid-cols-2 gap-8 w-full max-w-7xl">
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
              <div>
                {server && (
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 250 }}
                    className="relative w-full"
                  >
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
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          className="absolute mt-2 left-0 w-64 bg-gray-800/90 border border-blue-500/50 shadow-lg rounded-lg p-3 text-xs text-gray-300 z-20"
                        >
                          {server.specs.map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

              <div>
                {gpu && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectGPU(gpu.id)}
                    disabled={selectedGPU && selectedGPU !== gpu.id}
                    className={`w-full p-4 rounded-xl border-2 text-xl font-bold transition-all duration-300 ${
                      selectedGPU === gpu.id
                        ? "bg-green-950 border-green-400 shadow-[0_0_25px_8px_rgba(74,222,128,0.8)] text-green-300"
                        : selectedGPU && selectedGPU !== gpu.id
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 border-gray-700 hover:border-green-400 hover:text-green-300"
                    }`}
                  >
                    {gpu.name}
                  </motion.button>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {selectedServer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 text-center"
        >
          <div className="text-2xl mb-3 text-gray-300">
            {selectedGPU
              ? `Servidor: ${selectedServerObj?.title} + GPU: ${selectedGPUObj?.name}`
              : `Servidor seleccionado: ${selectedServerObj?.title}`}
          </div>
          {selectedGPU && (
            <div className="text-xl text-gray-400 mb-6">
              Costo total estimado: <span className="text-blue-400 font-bold">{totalCost.toFixed(2)} €/mes</span>
            </div>
          )}
          <button
            onClick={handleContinue}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg font-semibold shadow-lg transition-all duration-300"
          >
            Continuar 🚀
          </button>
        </motion.div>
      )}
    </div>
  );
}
