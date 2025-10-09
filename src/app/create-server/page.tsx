"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateServerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [serverInfo, setServerInfo] = useState<any>(null);

  // 🔹 Datos enviados desde la página anterior (servers-available)
  const userId = searchParams.get("userId") || "usuario-actual-id";
  const serverType = searchParams.get("serverType") || "CX32";
  const gpuType = searchParams.get("gpuType") || "NVIDIA RTX 3060";
  const osImage = searchParams.get("osImage") || "ubuntu-22.04";

  async function createServer() {
    try {
      setStatus("loading");
      setMessage("Creando tu servidor en Hetzner...");

      const res = await fetch("https://TU-IP-O-DOMINIO:4000/api/create-user-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          serverType,
          gpuType,
          osImage,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al crear servidor");

      setStatus("success");
      setMessage("Servidor creado con éxito 🚀");
      setServerInfo(data);
    } catch (err: any) {
      console.error("❌ Error al crear servidor:", err);
      setStatus("error");
      setMessage(err.message);
    }
  }

  useEffect(() => {
    createServer();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-lg shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            Crear servidor en Hetzner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
              <p className="text-green-700 font-medium">{message}</p>

              <div className="bg-gray-100 p-4 rounded-lg w-full text-left text-sm">
                <p><strong>Hetzner ID:</strong> {serverInfo?.hetznerId}</p>
                <p><strong>IP pública:</strong> {serverInfo?.ip}</p>
                <p><strong>Status:</strong> {serverInfo?.status}</p>
                <p><strong>Tipo:</strong> {serverType}</p>
                <p><strong>GPU:</strong> {gpuType}</p>
              </div>

              <Button onClick={() => router.push("/dashboard")} className="mt-2">
                Ir al panel principal
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-3">
              <XCircle className="w-10 h-10 text-red-500" />
              <p className="text-red-600 font-medium">{message}</p>
              <Button onClick={() => createServer()} variant="outline">
                Reintentar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
