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

  // Función para cerrar sesión
  const handleLogout = () => {
    // Aquí puedes agregar lógica de logout si es necesario
    console.log("Salir");
  };

  return (
    <div className="h-screen w-screen bg-gray-950 text-white flex flex-col">
      {/* Header superior */}
      <div className="w-full flex justify-end items-center p-4 gap-4 border-b border-gray-800">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-semibold"
        >
          Salir
        </button>
        <img
          src="/profile.jpg" // Reemplaza con la ruta de la imagen de perfil
          alt="Foto de perfil"
          className="w-10 h-10 rounded-full"
        />
      </div>

      {/* Contenido central */}
      <div className="flex flex-col items-center justify-center flex-1 text-3xl">
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
