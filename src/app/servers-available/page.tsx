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

  // Cargar servidores Hetzner
  useEffect(() => {
    const hetznerServers: Server[] = [
      { id: "1", title: "CX32", cpu: "8 vCPU", ram: "32GB", price: 45 },
      { id: "2", title: "CX42", cpu: "16 vCPU", ram: "64GB", price: 80 },
      { id: "3", title: "AX101", cpu: "32 vCPU", ram: "128GB", price: 130 },
      { id: "4", title: "AX161", cpu: "48 vCPU", ram: "256GB", price: 200 },
    ];
    setServers(hetznerServers);
  }, []);

  // GPUs de Salad
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

  // Tomamos la longitud máxima para emparejar filas
  const maxRows = Math.max(servers.length, saladGPUs.length);

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 text-white px-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">Selecciona tu Servidor y GPU</h1>

      {/* TABLA DE DOS COLUMNAS (Servidor | GPU) */}
      <div className="grid grid-cols-2 gap-6">
        {/* Encabezados */}
        <div className="text-center text-2xl font-semibold text-green-400 border-b border-gray-700 pb-2">
          Servidores Hetzner
        </div>
        <div className="text-center text-2xl font-semibold text-blue-400 border-b border-gray-700 pb-2">
          GPUs disponibles (Salad)
        </div>

        {/* Filas */}
        {Array.from({ length: maxRows }).map((_, index) => {
          const server = servers[index];
          const gpu = saladGPUs[index];

          return (
            <React.Fragment key={index}>
              {/* Celda servidor */}
              <div>
                {server ? (
                  <button
                    onClick={() => handleSelectServer(server.id)}
                    disabled={selectedServer && selectedServer !== server.id}
                    className={`w-full p-5 rounded-lg text-left border-2 transition-all ${
                      selectedServer === server.id
                        ? "bg-green-700 border-green-400"
                        : selectedServer && selectedServer !== server.id
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 border-gray-700 hover:border-green-400"
                    }`}
                  >
                    <h3 className="text-2xl font-bold">{server.title}</h3>
                    <p className="text-lg text-gray-300">{server.cpu} • {server.ram}</p>
                    <p className="text-md text-gray-400">{server.price} €/mes</p>
                  </button>
                ) : (
                  <div className="h-24"></div>
                )}
              </div>

              {/* Celda GPU */}
              <div>
                {gpu ? (
                  <button
                    onClick={() => handleSelectGPU(gpu.id)}
                    disabled={selectedGPU && selectedGPU !== gpu.id}
                    className={`w-full p-5 rounded-lg text-left border-2 transition-all ${
                      selectedGPU === gpu.id
                        ? "bg-blue-700 border-blue-400"
                        : selectedGPU && selectedGPU !== gpu.id
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 border-gray-700 hover:border-blue-400"
                    }`}
                  >
                    <h3 className="text-xl font-semibold">{gpu.name}</h3>
                    <p className="text-md text-gray-300">{gpu.vram} • {gpu.architecture}</p>
                  </button>
                ) : (
                  <div className="h-24"></div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
