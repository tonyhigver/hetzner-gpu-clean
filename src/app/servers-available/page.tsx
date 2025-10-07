"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

export default function ServersAvailablePage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedGPU, setSelectedGPU] = useState<string | null>(null);
  const router = useRouter();

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

  const handleSelectServer = (id: string) => {
    setSelectedServer((prev) => (prev === id ? null : id));
  };

  const handleSelectGPU = (id: string) => {
    setSelectedGPU((prev) => (prev === id ? null : id));
  };

  // Calcular coste total
  const selectedServerObj = servers.find((s) => s.id === selectedServer);
  const selectedGPUObj = saladGPUs.find((g) => g.id === selectedGPU);
  const totalCost =
    (selectedServerObj ? selectedServerObj.price : 0) +
    (selectedGPUObj ? selectedGPUObj.price : 0);

  // Acción al hacer clic en Aceptar
  const handleContinue = () => {
    if (!selectedServer) {
      alert("Por favor selecciona un servidor antes de continuar.");
      return;
    }
    router.push("/hetzner-rent");
  };

  // Longitud máxima de filas
  const maxRows = Math.max(servers.length, saladGPUs.length);

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 text-white px-6 overflow-y-auto max-h-[90vh]">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">
        Selecciona tu Servidor y GPU
      </h1>

      {/* TABLA DE DOS COLUMNAS */}
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
              {/* SERVIDOR */}
              <div>
                {server ? (
                  <button
                    onClick={() => handleSelectServer(server.id)}
                    disabled={selectedServer && selectedServer !== server.id}
                    className={`w-full p-5 rounded-lg text-left border-2 transition-all duration-300 ${
                      selectedServer === server.id
                        ? "bg-blue-950 border-blue-400 shadow-[0_0_30px_10px_rgba(30,64,175,0.9)] text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,1)]"
                        : selectedServer && selectedServer !== server.id
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 border-gray-700 hover:border-blue-400"
                    }`}
                  >
                    <h3
                      className={`text-2xl font-bold ${
                        selectedServer === server.id ? "text-blue-300" : ""
                      }`}
                    >
                      {server.title}
                    </h3>
                    <p className="text-lg text-gray-300">
                      {server.cpu} • {server.ram}
                    </p>
                    <p className="text-md text-gray-400">{server.price} €/mes</p>
                  </button>
                ) : (
                  <div className="h-24"></div>
                )}
              </div>

              {/* GPU */}
              <div>
                {gpu ? (
                  <button
                    onClick={() => handleSelectGPU(gpu.id)}
                    disabled={selectedGPU && selectedGPU !== gpu.id}
                    className={`w-full p-5 rounded-lg text-left border-2 transition-all duration-300 ${
                      selectedGPU === gpu.id
                        ? "bg-blue-950 border-blue-400 shadow-[0_0_30px_10px_rgba(30,64,175,0.9)] text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,1)]"
                        : selectedGPU && selectedGPU !== gpu.id
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 border-gray-700 hover:border-blue-400"
                    }`}
                  >
                    <h3
                      className={`text-xl font-semibold ${
                        selectedGPU === gpu.id ? "text-blue-300" : ""
                      }`}
                    >
                      {gpu.name}
                    </h3>
                    <p className="text-md text-gray-300">
                      {gpu.vram} • {gpu.architecture}
                    </p>
                    <p className="text-md text-gray-400">{gpu.price} €/mes</p>
                  </button>
                ) : (
                  <div className="h-24"></div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ESPACIO GRANDE ENTRE LA TABLA Y LA LÍNEA */}
      <div className="h-40"></div>

      {/* Línea discontinua + total + botón */}
      <div className="mb-10 w-full">
        <hr className="border-t-4 border-dashed border-gray-500 mb-12" />

        <div className="text-center text-2xl font-semibold text-blue-400 drop-shadow-[0_0_8px_rgba(147,197,253,1)] mb-10">
          {totalCost > 0
            ? `💰 Total: ${totalCost} €/mes`
            : "Selecciona un servidor y una GPU para ver el total"}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!selectedServer}
            className={`px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
              selectedServer
                ? "bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_4px_rgba(96,165,250,0.8)] text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            ✅ Aceptar y continuar
          </button>
        </div>
      </div>
    </div>
  );
}
