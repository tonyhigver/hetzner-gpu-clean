"use client";
import { useEffect, useState } from "react";

// Simulación de datos del usuario / servidores
const serversData = [
  { id: 1, status: "running", gpu: "RTX 3060", price: 10 },
  { id: 2, status: "paused", gpu: "RTX 3080", price: 20 },
];

const checkpointsData = [
  { date: "2025-10-12", size: "20GB", server: "Server 1" },
  { date: "2025-10-11", size: "15GB", server: "Server 2" },
];

export default function CommandCenter() {
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const price = serversData.reduce((acc, srv) => acc + srv.price, 0);
    setTotalPrice(price);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#E6E6E6] p-6 flex flex-col gap-8">
      {/* 🖥️ Resumen del sistema */}
      <section className="bg-[#1E1F26] p-6 rounded-2xl border border-[#00C896] shadow-lg">
        <h2 className="text-2xl font-bold text-[#00C896] mb-4">🖥️ Resumen del sistema</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>Servidores activos: {serversData.filter(s => s.status === "running").length}</div>
          <div>Servidores en pausa: {serversData.filter(s => s.status === "paused").length}</div>
          <div>GPUs conectadas: {serversData.length}</div>
          <div>
            Estado general: 
            {serversData.every(s => s.status === "running") ? " 🟢 Running" : " 🟠 Idle / 🔴 Down"}
          </div>
        </div>
      </section>

      {/* ⚡ Rendimiento global */}
      <section className="bg-[#1E1F26] p-6 rounded-2xl border border-[#00C896] shadow-lg">
        <h2 className="text-2xl font-bold text-[#00C896] mb-4">⚡ Rendimiento global</h2>
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="bg-[#0B0C10] h-32 rounded flex items-center justify-center text-[#00C896] font-mono">
            Gráfico CPU/RAM/GPU (Simulación)
          </div>
          <div className="text-lg">
            💰 Total gastado: ${totalPrice.toFixed(2)}
          </div>
        </div>
      </section>

      {/* 💾 Últimos checkpoints */}
      <section className="bg-[#1E1F26] p-6 rounded-2xl border border-[#00C896] shadow-lg">
        <h2 className="text-2xl font-bold text-[#00C896] mb-4">💾 Últimos checkpoints</h2>
        <ul className="space-y-2 text-sm">
          {checkpointsData.map((c, i) => (
            <li key={i} className="flex justify-between border-b border-gray-700 pb-2">
              <span>{c.date}</span>
              <span>{c.size}</span>
              <span>{c.server}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 🕹️ Acciones rápidas */}
      <section className="bg-[#1E1F26] p-6 rounded-2xl border border-[#00C896] shadow-lg flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-[#00C896] mb-4">🕹️ Acciones rápidas</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-[#00C896] px-4 py-2 rounded-lg hover:bg-[#00E676] transition font-semibold">
            Deploy nuevo servidor
          </button>
          <button className="bg-[#29B6F6] px-4 py-2 rounded-lg hover:bg-[#64B5F6] transition font-semibold">
            Encender GPU
          </button>
          <button className="bg-[#FF5252] px-4 py-2 rounded-lg hover:bg-[#FF6666] transition font-semibold">
            Abrir Terminal Rogue
          </button>
        </div>
      </section>
    </div>
  );
}
