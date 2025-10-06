"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Server {
  id: string;
  title: string;
  cpu: string;
  ram: string;
  gpu: string;
  price: number;
}

export default function ServersAvailablePage() {
  const { status } = useSession();
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/servers")
      .then(res => res.json())
      .then(data => setServers(data))
      .catch(err => console.error("Error al cargar servidores:", err));
  }, []);

  return (
    <section className="w-full max-w-6xl mx-auto mt-0 px-6">
      <h1 className="text-3xl font-bold text-white mb-6">Servidores Disponibles</h1>

      {servers.length === 0 ? (
        <p className="text-gray-300">Cargando servidores...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {servers.map(server => (
            <div
              key={server.id}
              className="bg-gray-800 text-white rounded-lg p-8 shadow-xl border border-gray-700"
            >
              <h2 className="text-2xl font-semibold mb-3">{server.title}</h2>
              <p className="text-sm text-gray-300 mb-4">
                {server.cpu} • {server.ram} • {server.gpu}
              </p>
              <p className="text-lg font-bold mb-5">{server.price} €/mes</p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition">
                Elegir servidor
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
