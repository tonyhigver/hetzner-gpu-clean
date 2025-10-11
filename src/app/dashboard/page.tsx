"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [showServers, setShowServers] = useState(false);

  // 🔹 Después de 15 segundos, mostrar "SERVIDORES"
  useEffect(() => {
    const timer = setTimeout(() => setShowServers(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white text-3xl bg-gray-950">
      <div>🚀 Dashboard funcionando correctamente.</div>
      {showServers && <div className="mt-8 text-4xl font-bold text-blue-400">SERVIDORES</div>}
    </div>
  );
}
