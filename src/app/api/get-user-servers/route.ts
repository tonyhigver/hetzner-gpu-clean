export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// Conexión Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Tokens Hetzner
const hetznerProjects = [
  { name: "PROJECT1", token: process.env.HETZNER_API_TOKEN_PROJECT1 },
  { name: "PROJECT2", token: process.env.HETZNER_API_TOKEN_PROJECT2 },
  { name: "PROJECT3", token: process.env.HETZNER_API_TOKEN_PROJECT3 },
  { name: "PROJECT4", token: process.env.HETZNER_API_TOKEN_PROJECT4 },
].filter((p) => !!p.token);

// Obtener servidores de Hetzner
async function fetchHetznerServers() {
  let allServers: any[] = [];
  for (const { token } of hetznerProjects) {
    try {
      const res = await axios.get("https://api.hetzner.cloud/v1/servers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.servers) allServers = allServers.concat(res.data.servers);
    } catch (err) {
      console.error("❌ Error obteniendo servidores de Hetzner:", err);
    }
  }
  return allServers;
}

// Sincronizar Hetzner ↔ Supabase
async function syncServers() {
  const hetznerServers = await fetchHetznerServers();
  if (!hetznerServers.length) return;

  const { data: dbServers, error } = await supabase.from("user_servers").select("*");
  if (error) {
    console.error("❌ Error leyendo Supabase:", error);
    return;
  }

  const hetznerIds = hetznerServers.map((s) => s.id.toString());

  // Eliminar servidores inactivos
  for (const server of dbServers) {
    if (!hetznerIds.includes(server.hetzner_server_id)) {
      await supabase.from("user_servers").delete().eq("id", server.id);
      console.log(`🗑️ Eliminado servidor inactivo: ${server.hetzner_server_id}`);
    }
  }

  // Insertar/Actualizar servidores activos
  for (const server of hetznerServers) {
    const existing = dbServers.find((s) => s.hetzner_server_id === server.id.toString());
    const serverData: any = {
      hetzner_server_id: server.id.toString(),
      server_name: server.name,
      status: server.status,
      gpu_type: server.labels?.gpu || null,
      ip: server.public_net?.ipv4?.ip || null,
      location: server.location?.name || null,
      user_id: existing?.user_id || null, // ❗ Mantener user_id
    };

    if (existing) {
      await supabase.from("user_servers").update(serverData).eq("id", existing.id);
      console.log(`🟢 Actualizado servidor: ${server.name}`);
    } else {
      await supabase.from("user_servers").insert(serverData);
      console.log(`🆕 Insertado nuevo servidor: ${server.name}`);
    }
  }

  return true;
}

// Route principal
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");
    if (!rawEmail) return NextResponse.json({ error: "Falta email" }, { status: 400 });

    const email = rawEmail.trim().toLowerCase();

    // Ejecutar sincronización
    await syncServers();

    // Traer servidores filtrados por user_id (email)
    const { data: userServers, error } = await supabase
      .from("user_servers")
      .select("*")
      .eq("user_id", email);

    if (error) throw error;

    return NextResponse.json({
      servers: userServers || [],
      total: userServers?.length || 0,
      email,
    });
  } catch (err) {
    console.error("💥 Error en /api/servers:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
