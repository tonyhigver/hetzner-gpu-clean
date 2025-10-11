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
    <div className="min-h-screen bg-gray-950 text-white p-6 relative">
      {/* Nombre de usuario arriba a la derecha */}
      <div className="absolute top-6 right-6 text-xl font-semibold text-blue-400">
        AllyRogue
      </div>

      {/* Contenido centrado */}
      <div className="flex flex-col items-center justify-center h-full text-3xl">
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
