"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardClient() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard/command-center"); // Redirige al Command Center
    }, 1000); // 1 segundo

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen w-screen bg-gray-950 text-white flex flex-col items-center justify-center">
      {/* Contenido central */}
      <div className="flex flex-col items-center justify-center text-3xl bg-gray-900 p-12 rounded-xl shadow-lg">
        <div className="text-xl font-bold text-blue-400 mb-4">AllyRogue</div>
        <div>🚀 Dashboard funcionando correctamente.</div>
      </div>
    </div>
  );
}
