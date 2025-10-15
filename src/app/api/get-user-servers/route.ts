export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// ✅ Conexión Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Tokens Hetzner
const hetznerProjects = [
  { name: "PROJECT1", token: process.env.HETZNER_API_TOKEN_PROJECT1 },
  { name: "PROJECT2", token: process.env.HETZNER_API_TOKEN_PROJECT2 },
  { name: "PROJECT3", token: process.env.HETZNER_API_TOKEN_PROJECT3 },
  { name: "PROJECT4", token: process.env.HETZNER_API_TOKEN_PROJECT4 },
].filter((p) => !!p.token);

// 🔹 Obtener todos los servidores de Hetzner
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

// 🔹 Sincronizar Hetzner ↔ Supabase y retornar servidores
async function syncServers() {
  const hetznerServers = await fetchHetznerServers();
  if (!hetznerServers.length) return [];

  const { data: dbServers, error } = await supabase.from("user_servers").select("*");
  if (error) {
    console.error("❌ Error leyendo Supabase:", error);
    return [];
  }

  const hetznerIds = hetznerServers.map((s) => s.id.toString());

  // 🧹 Eliminar servidores que ya no existen
  for (const server of dbServers) {
    if (!hetznerIds.includes(server.hetzner_server_id)) {
      await supabase.from("user_servers").delete().eq("id", server.id);
      console.log(`🗑️ Eliminado servidor inactivo: ${server.hetzner_server_id}`);
    }
  }

  // 🔄 Insertar o actualizar servidores activos
  for (const server of hetznerServers) {
    const existing = dbServers.find((s) => s.hetzner_server_id === server.id.toString());

    const serverData = {
      hetzner_server_id: server.id.toString(),
      server_name: server.name,
      status: server.status,
      gpu_type: server.labels?.gpu || null,
      ip: server.public_net?.ipv4?.ip || null,
      location: server.location?.name || null,
    };

    if (existing) {
      await supabase.from("user_servers").update(serverData).eq("id", existing.id);
      console.log(`🟢 Actualizado servidor: ${server.name}`);
    } else {
      await supabase.from("user_servers").insert(serverData);
      console.log(`🆕 Insertado nuevo servidor: ${server.name}`);
    }
  }

  return hetznerServers;
}

// 🚀 Endpoint principal
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");
    if (!rawEmail) {
      return NextResponse.json({ error: "Falta el parámetro email" }, { status: 400 });
    }
    const email = rawEmail.trim().toLowerCase();

    // 1️⃣ Ejecutar sincronización automáticamente
    let hetznerServers: any[] = [];
    try {
      hetznerServers = await syncServers();
      console.log("✅ Sync ejecutado desde route");
    } catch (err) {
      console.error("⚠️ Error al ejecutar syncServers:", err);
    }

    // 2️⃣ Traer todos los servidores de Supabase
    const { data: allServers, error } = await supabase.from("user_servers").select("*");
    if (error) throw error;

    // 3️⃣ Filtrar por email
    const userServers = allServers.filter(
      (srv) => String(srv.user_id).trim().toLowerCase() === email
    );

    if (!userServers.length) {
      return NextResponse.json({ servers: [] });
    }

    // 4️⃣ Mapear info combinada Hetzner + Supabase
    const results = userServers.map((srv) => {
      const id = String(srv.hetzner_server_id);
      const server = hetznerServers.find((s) => s.id.toString() === id);
      return server
        ? {
            id,
            name: server.name,
            ip: server.public_net?.ipv4?.ip || "Sin IP",
            status: server.status,
            type: srv.server_type || "Desconocido",
            gpu: srv.gpu_type || "N/A",
            project: hetznerProjects.find((p) => p.token === server.token)?.name || "Desconocido",
          }
        : null;
    }).filter(Boolean);

    return NextResponse.json({
      servers: results,
      total: results.length,
      email,
    });
  } catch (err) {
    console.error("💥 Error general en /api/servers:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
