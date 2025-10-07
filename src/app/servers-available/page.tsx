"use client";
import { useState, useEffect } from "react";

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
}

export default function ServersAvailablePage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedGPU, setSelectedGPU] = useState<string | null>(null);

  // Datos simulados de Hetzner
  useEffect(() => {
    const hetznerServers: Server[] = [
      { id: "1", title: "CX32", cpu: "8 vCPU", ram: "32GB", price: 45 },
      { id: "2", title: "CX42", cpu: "16 vCPU", ram: "64GB", price: 80 },
      { id: "3", title: "AX101", cpu: "32 vCPU", ram: "128GB", price: 130 },
      { id: "4", title: "AX161", cpu: "48 vCPU", ram: "256GB", price: 200 },
    ];
    setServers(hetznerServers);
  }, []);

  // Lista completa de GPUs de Salad
  const saladGPUs: GPU[] = [
    { id: "1", name: "NVIDIA RTX 3060", vram: "12 GB", architecture: "Ampere" },
    { id: "2", name: "NVIDIA RTX 3070", vram: "8 GB", architecture: "Ampere" },
    { id: "3", name: "NVIDIA RTX 3080", vram: "10 GB", architecture: "Ampere" },
    { id: "4", name: "NVIDIA RTX 3090", vram: "24 GB", architecture: "Ampere" },
    { id: "5", name: "NVIDIA RTX 4070", vram: "12 GB", architecture: "Ada Lovelace" },
    { id: "6", name: "NVIDIA RTX 4080", vram: "16 GB", architecture: "Ada Lovelace" },
    { id: "7", name: "NVIDIA RTX 4090", vram: "24 GB", architecture: "Ada Lovelace" },
    { id: "8", name: "NVIDIA A100", vram: "80 GB", architecture: "Ampere" },
    { id: "9", name: "NVIDIA H100", vram: "80 GB", architecture: "Hopper" },
    { id: "10", name: "NVIDIA A6000", vram: "48 GB", architecture: "Ampere" },
    { id: "11", name: "NVIDIA T4", vram: "16 GB", architecture: "Turing" },
    { id: "12", name: "NVIDIA V100", vram: "32 GB", architecture: "Volta" },
    { id: "13", name: "NVIDIA P100", vram: "16 GB", architecture: "Pascal" },
    { id: "14", name: "NVIDIA K80", vram: "24 GB", architecture: "Kepler" },
  ];

  const handleSelectServer = (id: string) => {
    setSelectedServer(prev => (prev === id ? null : id));
  };

  const handleSelectGPU = (id: string) => {
    setSelectedGPU(prev => (prev === id ? null : id));
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 text-white px-6">
      {/* ====== GRID DE DOS COLUMNAS (Servidores / GPUs) ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
        {/* ====================== SERVIDORES ====================== */}
        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col h-full shadow-lg border border-gray-800">
          <h2 className="text-4xl font-bold mb-5 text-center text-green-400">Servidores Hetzner</h2>
          <div className="flex-1 flex flex-col justify-between space-y-4">
            {servers.map(server => (
              <button
                key={server.id}
                onClick={() => handleSelectServer(server.id)}
                disabled={selectedServer && selectedServer !== server.id}
                className={`p-6 rounded-lg text-left border-2 transition-all ${
                  selectedServer === server.id
                    ? "bg-green-700 border-green-400 shadow-md"
                    : selectedServer && selectedServer !== server.id
                    ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-800 border-gray-700 hover:border-green-500"
                }`}
              >
                <h3 className="text-3xl font-semibold mb-1">{server.title}</h3>
                <p className="text-lg text-gray-300">
                  {server.cpu} • {server.ram}
                </p>
                <p className="text-xl text-gray-400 mt-1">{server.price} €/mes</p>
              </button>
            ))}
          </div>
        </div>

        {/* ====================== GPUS ====================== */}
        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col h-full shadow-lg border border-gray-800">
          <h2 className="text-4xl font-bold mb-5 text-center text-blue-400">GPUs disponibles (Salad)</h2>
          <div className="flex-1 overflow-y-auto pr-2 grid gap-4 max-h-[700px]">
            {saladGPUs.map(gpu => (
              <button
                key={gpu.id}
                onClick={() => handleSelectGPU(gpu.id)}
                disabled={selectedGPU && selectedGPU !== gpu.id}
                className={`p-4 rounded-lg text-left border-2 transition-all ${
                  selectedGPU === gpu.id
                    ? "bg-blue-700 border-blue-400 shadow-md"
                    : selectedGPU && selectedGPU !== gpu.id
                    ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-800 border-gray-700 hover:border-blue-500"
                }`}
              >
                <h3 className="text-2xl font-semibold">{gpu.name}</h3>
                <p className="text-md text-gray-300">
                  {gpu.vram} • {gpu.architecture}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
