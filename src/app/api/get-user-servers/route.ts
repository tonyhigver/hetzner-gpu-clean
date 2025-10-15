export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// ✅ Conexión a Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Tokens de Hetzner
const hetznerTokens = [
  process.env.HETZNER_API_TOKEN_PROJECT1,
  process.env.HETZNER_API_TOKEN_PROJECT2,
  process.env.HETZNER_API_TOKEN_PROJECT3,
  process.env.HETZNER_API_TOKEN_PROJECT4,
].filter(Boolean);

// 🔹 Obtener todos los servidores de Hetzner
async function fetchHetznerServers() {
  let allServers: any[] = [];
  for (const token of hetznerTokens) {
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

// 🔹 Sincronizar Hetzner ↔ Supabase
async function syncServers() {
  const hetznerServers = await fetchHetznerServers();
  if (!hetznerServers.length) return;

  const { data: dbServers, error } = await supabase.from("user_servers").select("*");
  if (error) {
    console.error("❌ Error leyendo Supabase:", error);
    return;
  }

  const hetznerIds = hetznerServers.map((s) => s.id.toString());

  // Eliminar servidores que ya no existen
  for (const server of dbServers) {
    if (!hetznerIds.includes(server.hetzner_server_id)) {
      await supabase.from("user_servers").delete().eq("id", server.id);
      console.log(`🗑️ Eliminado servidor inactivo: ${server.hetzner_server_id}`);
    }
  }

  // Insertar o actualizar servidores activos
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
}

// 🔹 Obtener servidores de un usuario y ejecutar sync automáticamente
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");
    if (!rawEmail) return NextResponse.json({ error: "Falta el parámetro email" }, { status: 400 });
    const email = rawEmail.trim().toLowerCase();

    // 1️⃣ Ejecutar sincronización automáticamente
    try {
      await syncServers();
      console.log("✅ Sync ejecutado desde route");
    } catch (err) {
      console.error("⚠️ Error al ejecutar syncServers:", err);
    }

    // 2️⃣ Obtener servidores desde Supabase filtrando por email
    const { data: allServers, error } = await supabase.from("user_servers").select("*");
    if (error) throw error;

    const userServers = allServers.filter(
      (srv) => String(srv.user_id).trim().toLowerCase() === email
    );

    if (!userServers.length) return NextResponse.json({ servers: [] });

    // 3️⃣ Opcional: verificar estado running en Hetzner (como en tu route original)
    const results = await Promise.all(
      userServers.map(async (srv) => {
        const id = String(srv.hetzner_server_id);
        if (!id) return null;
        const server = hetznerServers.find((s) => s.id.toString() === id);
        return server
          ? {
              id,
              name: server.name,
              ip: server.public_net?.ipv4?.ip || "Sin IP",
              status: server.status,
              type: srv.server_type || "Desconocido",
              gpu: srv.gpu_type || "N/A",
            }
          : null;
      })
    );

    return NextResponse.json({ servers: results.filter(Boolean) });
  } catch (err) {
    console.error("💥 Error en /api/get-user-servers:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
