import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

async function createHetznerServer(serverType: string, osImage: string, cloudInit: string) {
  const res = await fetch("https://api.hetzner.cloud/v1/servers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HETZNER_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `user-server-${Date.now()}`,
      server_type: serverType,
      image: osImage,
      ssh_keys: [process.env.SSH_KEY_ID],
      user_data: cloudInit,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al crear servidor en Hetzner: ${text}`);
  }

  const data = await res.json();
  return data.server;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { userId, serverType, gpuType, osImage } = req.body;

  if (!userId || !serverType) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    // Cloud-init básico para instalar mini-agent
    const cloudInit = `
#cloud-config
runcmd:
  - apt update -y
  - apt install -y curl
  - curl -sSL https://tu-dominio.com/install-agent.sh | bash
`;

    // Crear servidor en Hetzner
    const server = await createHetznerServer(serverType, osImage || "ubuntu-22.04", cloudInit);

    // Guardar info en Supabase
    const { data, error } = await supabase.from("user_servers").insert([
      {
        user_id: userId,
        hetzner_server_id: server.id,
        server_type: serverType,
        gpu_type: gpuType || null,
        ip: server.public_net.ipv4.ip,
        status: "pending",
        agent_status: "offline",
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    res.status(200).json({
      message: "Servidor creado con éxito",
      serverId: server.id,
      ip: server.public_net.ipv4.ip,
      status: "pending",
    });
  } catch (err: any) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
}
