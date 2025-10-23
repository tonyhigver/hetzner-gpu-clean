"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ServerGpuSelector() {
  const router = useRouter();

  // ======================
  // SERVIDORES
  // ======================
  const servers = [
    // Nimbus
    {
      id: "srv-1",
      title: "Nimbus I",
      cpu: "2 (Intel)",
      ram: "4GB",
      price: 9.9,
      specs: ["RAM: 4GB", "SSD: 80GB", "vCPU: 2 (Intel)", "Tráfico: 10TB", "Precio/h: 0.0137€", "Precio: 9.9€"],
    },
    {
      id: "srv-2",
      title: "Nimbus II",
      cpu: "4 (Intel)",
      ram: "8GB",
      price: 18.5,
      specs: ["RAM: 8GB", "SSD: 160GB", "vCPU: 4 (Intel)", "Tráfico: 20TB", "Precio/h: 0.0256€", "Precio: 18.5€"],
    },
    {
      id: "srv-3",
      title: "Nimbus III",
      cpu: "8 (Intel)",
      ram: "16GB",
      price: 34.9,
      specs: ["RAM: 16GB", "SSD: 320GB", "vCPU: 8 (Intel)", "Tráfico: 30TB", "Precio/h: 0.0484€", "Precio: 34.9€"],
    },
    {
      id: "srv-4",
      title: "Nimbus IV",
      cpu: "16 (Intel)",
      ram: "32GB",
      price: 66.5,
      specs: ["RAM: 32GB", "SSD: 640GB", "vCPU: 16 (Intel)", "Tráfico: 40TB", "Precio/h: 0.0924€", "Precio: 66.5€"],
    },

    // Stratus
    {
      id: "srv-5",
      title: "Stratus II",
      cpu: "4 (AMD)",
      ram: "8GB",
      price: 16.5,
      specs: ["RAM: 8GB", "SSD: 160GB", "vCPU: 4 (AMD)", "Tráfico: 20TB", "Precio/h: 0.0229€", "Precio: 16.5€"],
    },
    {
      id: "srv-6",
      title: "Stratus III",
      cpu: "8 (AMD)",
      ram: "16GB",
      price: 29.5,
      specs: ["RAM: 16GB", "SSD: 320GB", "vCPU: 8 (AMD)", "Tráfico: 20TB", "Precio/h: 0.0410€", "Precio: 29.5€"],
    },
    {
      id: "srv-7",
      title: "Stratus IV",
      cpu: "12 (AMD)",
      ram: "24GB",
      price: 39.96,
      specs: ["RAM: 24GB", "SSD: 480GB", "vCPU: 12 (AMD)", "Tráfico: 20TB", "Precio/h: 0.0555€", "Precio: 39.96€"],
    },
    {
      id: "srv-8",
      title: "Stratus V",
      cpu: "16 (AMD)",
      ram: "32GB",
      price: 54.95,
      specs: ["RAM: 32GB", "SSD: 640GB", "vCPU: 16 (AMD)", "Tráfico: 20TB", "Precio/h: 0.0763€", "Precio: 54.95€"],
    },

    // Titan
    {
      id: "srv-9",
      title: "Titan I",
      cpu: "2 (AMD)",
      ram: "8GB",
      price: 18.86,
      specs: ["RAM: 8GB", "SSD: 80GB", "vCPU: 2 (AMD)", "Tráfico: 20TB", "Precio/h: 0.0262€", "Precio: 18.86€"],
    },
    {
      id: "srv-10",
      title: "Titan II",
      cpu: "4 (AMD)",
      ram: "16GB",
      price: 34.25,
      specs: ["RAM: 16GB", "SSD: 160GB", "vCPU: 4 (AMD)", "Tráfico: 20TB", "Precio/h: 0.0475€", "Precio: 34.25€"],
    },
    {
      id: "srv-11",
      title: "Titan III",
      cpu: "8 (AMD)",
      ram: "32GB",
      price: 67.45,
      specs: ["RAM: 32GB", "SSD: 240GB", "vCPU: 8 (AMD)", "Tráfico: 30TB", "Precio/h: 0.0937€", "Precio: 67.45€"],
    },
    {
      id: "srv-12",
      title: "Titan IV",
      cpu: "16 (AMD)",
      ram: "64GB",
      price: 125.29,
      specs: ["RAM: 64GB", "SSD: 360GB", "vCPU: 16 (AMD)", "Tráfico: 40TB", "Precio/h: 0.174€", "Precio: 125.29€"],
    },
    {
      id: "srv-13",
      title: "Titan V",
      cpu: "4 (AMD)",
      ram: "16GB",
      price: 250.58,
      specs: ["RAM: 16GB", "SSD: 160GB", "vCPU: 4 (AMD)", "Tráfico: 20TB", "Precio/h: 0.348€", "Precio: 250.58€"],
    },
  ];

  // ======================
  // GPUS
  // ======================
  const gpus = [
    ["RTX 2080", 8, 23],
    ["RTX 3050", 8, 13.7],
    ["RTX 3060", 8, 13.7],
    ["RTX 3060 (12GB)", 12, 18.3],
    ["RTX 3070", 8, 18.3],
    ["RTX 3080", 10, 27.54],
    ["RTX 3080 Ti", 12, 36.7],
    ["RTX 3090", 24, 41.31],
    ["RTX 3090 Ti", 24, 45.9],
    ["RTX 4060 Ti", 16, 36.7],
    ["RTX 4070", 12, 36.7],
    ["RTX 4070 Ti", 12, 36.7],
    ["RTX 4070 Ti Super", 16, 50.79],
    ["RTX 4080", 16, 50.79],
    ["RTX 4090", 24, 73.44],
    ["RTX 5060 Ti", 16, 31.13],
    ["RTX 5070", 12, 36.7],
    ["RTX 5070 Ti", 16, 45.9],
    ["RTX 5080", 16, 82.6],
    ["RTX 5090", 32, 114.75],
    ["L40S", 48, 147.18],
    ["A100 (40GB PCIe)", 40, 183.6],
    ["A100 (80GB SXM)", 80, 230],
    ["H100 NVL", 94, 460],
  ].map(([name, vram, price], i) => {
    const hourly = (price as number) / (30 * 24);
    return {
      id: `gpu-${i + 1}`,
      title: name as string,
      vram: `${vram} GB`,
      architecture:
        name.toString().includes("A100") || name.toString().includes("H100")
          ? "Data Center"
          : "RTX Ada/Lovelace",
      price: price as number,
      specs: [
        `VRAM: ${vram} GB`,
        `Arquitectura: ${
          name.toString().includes("A100") || name.toString().includes("H100")
            ? "Data Center"
            : "RTX Ada/Lovelace"
        }`,
        `Precio/h: ${hourly.toFixed(3)}€`,
        `Precio: ${price}€`,
      ],
    };
  });

  // ======================
  // ESTADOS
  // ======================
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedGpu, setSelectedGpu] = useState<string | null>(null);
  const [openServerInfo, setOpenServerInfo] = useState<string | null>(null);
  const [openGpuInfo, setOpenGpuInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const total =
    (selectedServer ? servers.find((s) => s.id === selectedServer)?.price || 0 : 0) +
    (selectedGpu ? gpus.find((g) => g.id === selectedGpu)?.price || 0 : 0);

  const handleSelect = (type: "server" | "gpu", id: string) => {
    if (type === "server") setSelectedServer(selectedServer === id ? null : id);
    else setSelectedGpu(selectedGpu === id ? null : id);
  };

  const handleCreate = async () => {
    setLoading(true);
    setProgress(0);
    const interval = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 5)), 200);
    await new Promise((r) => setTimeout(r, 4000));
    clearInterval(interval);
    router.push("/dashboard/command-center");
  };

  // ======================
  // RENDER
  // ======================
  const renderServerGroup = (title: string, filter: string) => (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {servers
          .filter((s) => s.title.includes(filter))
          .map((s) => (
            <div
              key={s.id}
              className={`p-4 rounded-2xl border transition ${
                selectedServer === s.id ? "border-green-500 bg-green-900/20" : "border-gray-700 bg-gray-800/40"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="text-sm text-gray-400">
                    {s.cpu} • {s.ram} • {s.price}€
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-blue-400"
                    onClick={() => setOpenServerInfo(openServerInfo === s.id ? null : s.id)}
                  >
                    ℹ️
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-green-700 hover:bg-green-600"
                    onClick={() => handleSelect("server", s.id)}
                  >
                    {selectedServer === s.id ? "Deseleccionar" : "Elegir"}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {openServerInfo === s.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-2 text-sm text-gray-300"
                  >
                    {s.specs.map((sp) => (
                      <div key={sp}>• {sp}</div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
      </div>
      <div className="border-t border-dashed border-gray-600/50 mt-8 pt-8" />
    </div>
  );

  return (
    <div className="p-10 text-white max-w-[1600px] mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Configurador de Servidor y GPU</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* SERVIDORES */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Servidores</h2>
          {renderServerGroup("Nimbus", "Nimbus")}
          {renderServerGroup("Stratus", "Stratus")}
          {renderServerGroup("Titan", "Titan")}
        </div>

        {/* GPUS */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">GPUs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gpus.map((g) => (
              <div
                key={g.id}
                className={`p-4 rounded-2xl border transition ${
                  selectedGpu === g.id ? "border-yellow-500 bg-yellow-900/20" : "border-gray-700 bg-gray-800/40"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{g.title}</h3>
                    <p className="text-sm text-gray-400">
                      {g.vram} • {g.architecture} • {g.price}€
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-blue-400"
                      onClick={() => setOpenGpuInfo(openGpuInfo === g.id ? null : g.id)}
                    >
                      ℹ️
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-yellow-700 hover:bg-yellow-600"
                      onClick={() => handleSelect("gpu", g.id)}
                    >
                      {selectedGpu === g.id ? "Deseleccionar" : "Elegir"}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {openGpuInfo === g.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2 text-sm text-gray-300"
                    >
                      {g.specs.map((sp) => (
                        <div key={sp}>• {sp}</div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOTAL */}
      <div className="text-center mt-10">
        <h3 className="text-2xl font-bold">Total: {total.toFixed(2)} € / mes</h3>
      </div>

      {/* BOTÓN CREAR */}
      <div className="text-center mt-6">
        <button
          onClick={handleCreate}
          disabled={!selectedServer || !selectedGpu || loading}
          className="px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 disabled:bg-gray-600"
        >
          {loading ? "Creando servidor..." : "Crear Servidor"}
        </button>
      </div>

      {/* PROGRESO */}
      {loading && (
        <div className="mt-4 w-full bg-gray-700 h-3 rounded-full overflow-hidden">
          <motion.div
            className="bg-green-500 h-3"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
}
