"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // ✅ para obtener el correo del usuario logeado

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
  const supabase = createClientComponentClient(); // ✅ inicializa Supabase cliente

  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedGPU, setSelectedGPU] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // 🔹 Cargar usuario logeado desde Supabase
  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error("❌ Error al obtener usuario:", error);
      else if (data?.user) {
        setUserEmail(data.user.email ?? null);
        setUserId(data.user.id ?? null);
        console.log("✅ Usuario logeado:", data.user.email);
      } else {
        console.warn("⚠️ No hay usuario logeado en Supabase");
      }
    }
    fetchUser();
  }, [supabase]);

  // 🔹 Cargar servidores al montar
  useEffect(() => {
    setServers([
      { id: "1", title: "CX32", cpu: "8 vCPU", ram: "32GB", price: 45 },
      { id: "2", title: "CX42", cpu: "16 vCPU", ram: "64GB", price: 80 },
      { id: "3", title: "AX101", cpu: "32 vCPU", ram: "128GB", price: 130 },
      { id: "4", title: "AX161", cpu: "48 vCPU", ram: "256GB", price: 200 },
    ]);
  }, []);

  const saladGPUs: GPU[] = [
    { id: "1", name: "NVIDIA RTX 3060", vram: "12 GB", architecture: "Ampere", price: 40 },
    { id: "2", name: "NVIDIA RTX 3070", vram: "8 GB", architecture: "Ampere", price: 55 },
    { id: "3", name: "NVIDIA RTX 3080", vram: "10 GB", architecture: "Ampere", price: 70 },
    { id: "4", name: "NVIDIA RTX 3090", vram: "24 GB", architecture: "Ampere", price: 90 },
  ];

  const handleSelectServer = (id: string) =>
    setSelectedServer((prev) => (prev === id ? null : id));

  const handleSelectGPU = (id: string) =>
    setSelectedGPU((prev) => (prev === id ? null : id));

  const selectedServerObj = servers.find((s) => s.id === selectedServer);
  const selectedGPUObj = saladGPUs.find((g) => g.id === selectedGPU);
  const totalCost = (selectedServerObj?.price || 0) + (selectedGPUObj?.price || 0);

  // 🔹 Redirige a /processing con todos los parámetros
  const handleContinue = () => {
    if (!selectedServer) {
      alert("Por favor selecciona un servidor antes de continuar.");
      return;
    }

    // Si no hay correo o userId, prevenir el envío
    if (!userEmail || !userId) {
      alert("⚠️ No se detectó un usuario autenticado. Inicia sesión antes de continuar.");
      return;
    }

    const params = new URLSearchParams({
      userId,
      userEmail,
      serverType: selectedServerObj?.title || "",
      gpuType: selectedGPUObj?.name || "",
      osImage: "ubuntu-22.04",
    }).toString();

    router.push(`/processing?${params}`);
  };

  const maxRows = Math.max(servers.length, saladGPUs.length);

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 text-white px-6 min-h-screen pb-20">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">
        Selecciona tu Servidor y GPU
      </h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="text-center text-2xl font-semibold text-green-400 border-b border-gray-700 pb-2">
          Servidores Hetzner
        </div>
        <div className="text-center text-2xl font-semibold text-blue-400 border-b border-gray-700 pb-2">
          GPUs disponibles (Salad)
        </div>

        {Array.from({ length: maxRows }).map((_, index) => {
          const server = servers[index];
          const gpu = saladGPUs[index];
          return (
            <React.Fragment key={index}>
              <div>
                {server ? (
                  <button
                    onClick={() => handleSelectServer(server.id)}
                    disabled={selectedServer && selectedServer !== server.id}
                    className={`w-full p-5 rounded-lg text-center border-2 text-2xl font-bold transition-all duration-300 ${
                      selectedServer === server.id
                        ? "bg-blue-950 border-blue-400 shadow-[0_0_25px_8px_rgba(96,165,250,0.8)] text-blue-300"
                        : selectedServer && selectedServer !== server.id
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 border-gray-700 hover:border-blue-400 hover:text-blue-300"
                    }`}
                  >
                    {server.title}
                  </button>
                ) : (
                  <div className="h-20" />
                )}
              </div>

              <div>
                {gpu ? (
                  <button
                    onClick={() => handleSelectGPU(gpu.id)}
                    disabled={selectedGPU && selectedGPU !== gpu.id}
                    className={`w-full p-5 rounded-lg text-left border-2 transition-all duration-300 ${
                      selectedGPU === gpu.id
                        ? "bg-blue-950 border-blue-400 shadow-[0_0_30px_10px_rgba(30,64,175,0.9)] text-blue-300"
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
                  <div className="h-20" />
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-24 mb-24 w-full">
        <hr className="border-t-4 border-dashed border-gray-500 mb-12" />
        <div className="text-center text-2xl font-semibold text-blue-400 mb-10">
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
