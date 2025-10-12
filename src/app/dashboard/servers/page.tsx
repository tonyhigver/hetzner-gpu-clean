"use client";
import { useEffect, useState } from "react";

// Aquí simulas los datos de los servidores
const serversData = [
  { hetznerId: "srv-abc123", name: "Servidor 1", status: "running", gpu: "RTX 3060" },
  { hetznerId: "srv-def456", name: "Servidor 2", status: "paused", gpu: "RTX 3080" },
];

export default function ServersPage() {
  const [servers, setServers] = useState(serversData);

  // Si quieres, puedes usar useEffect para fetch real desde tu API
  useEffect(() => {
    // fetch("/api/get-servers").then(...).then(setServers)
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#E6E6E6] p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-[#00C896] mb-4">SERVERS</h1>

      <ul className="space-y-4">
        {servers.map((server) => (
          <li
            key={server.hetznerId}
            className="bg-[#1E1F26] p-4 rounded-2xl border border-[#00C896] shadow-lg flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-lg">{server.name}</p>
              <p>GPU: {server.gpu}</p>
            </div>
            <div className="text-right">
              <p>Status: {server.status === "running" ? "🟢 Running" : "🟠 Paused"}</p>
              <p>ID: {server.hetznerId}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
