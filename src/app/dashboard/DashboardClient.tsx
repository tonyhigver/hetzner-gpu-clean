"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";

export default function DashboardClient() {
  const [showServers, setShowServers] = useState(false);

  // 🔹 Mostrar la sección de SERVIDORES después de 15 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowServers(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen bg-gray-950 text-white flex flex-col items-center justify-center">
      {/* Contenido central */}
      <div className="flex flex-col items-center justify-center text-3xl bg-gray-900 p-12 rounded-xl shadow-lg">
        <div className="text-xl font-bold text-blue-400 mb-4">AllyRogue</div>
        <div>🚀 Dashboard funcionando correctamente.</div>
        {showServers && (
          <div className="mt-8 text-4xl font-bold text-blue-400">
            SERVIDORES
          </div>
        )}
      </div>
    </div>
  );
}
