export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Conexión a Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Tokens de Hetzner
const hetznerProjects = [
  { name: "PROJECT1", token: process.env.HETZNER_API_TOKEN_PROJECT1 },
  { name: "PROJECT2", token: process.env.HETZNER_API_TOKEN_PROJECT2 },
  { name: "PROJECT3", token: process.env.HETZNER_API_TOKEN_PROJECT3 },
  { name: "PROJECT4", token: process.env.HETZNER_API_TOKEN_PROJECT4 },
].filter((p) => !!p.token);

// 🔍 Buscar un servidor en Hetzner
async function fetchHetznerServer(serverId: string) {
  for (const { name, token } of hetznerProjects) {
    try {
      const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        return { server: data.server, project: name };
      }

      if (res.status === 404 || res.status === 401) continue;
    } catch (err) {
      console.error(`💥 Error al consultar ${name}:`, err);
    }
  }
  return null;
}

// 🕓 Espera hasta que el servidor esté "running"
async function waitForServerRunning(serverId: string, maxAttempts = 8, intervalMs = 4000) {
  for (let i = 1; i <= maxAttempts; i++) {
    const result = await fetchHetznerServer(serverId);
    if (result?.server?.status === "running") return result;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return null;
}

// 🚀 Ruta principal
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");

    if (!rawEmail) {
      return NextResponse.json({ error: "Falta el parámetro email" }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    console.log(`📧 Email recibido: ${email}`);

    // 1️⃣ Ejecutar el sync-servers.js del backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    console.log("🔁 Ejecutando limpieza con sync-servers:", backendUrl);

    try {
      const sync = await fetch(`${backendUrl}/api/sync-servers`, { cache: "no-store" });
      console.log(`✅ sync-servers ejecutado (${sync.status})`);
    } catch (err) {
      console.error("⚠️ No se pudo ejecutar sync-servers:", err);
    }

    // 2️⃣ Obtener servidores desde Supabase
    const { data: allServers, error: supaError } = await supabase
      .from("user_servers")
      .select("*");

    if (supaError) throw supaError;

    console.log("📦 Servidores totales en Supabase:", allServers?.length);

    // 3️⃣ Filtrar por email
    const userServers = allServers.filter(
      (srv) => String(srv.user_id).trim().toLowerCase() === email
    );

    if (userServers.length === 0) {
      console.log("⚠️ No hay servidores registrados para este usuario");
      return NextResponse.json({ servers: [] });
    }

    // 4️⃣ Consultar en Hetzner cada servidor
    const results = await Promise.all(
      userServers.map(async (srv) => {
        const id = String(srv.hetzner_server_id);
        if (!id || id === "undefined" || id === "null") return null;

        const result = await waitForServerRunning(id);

        if (!result) {
          console.log(`❌ Servidor ${id} no encontrado en Hetzner`);
          return null;
        }

        const { server, project } = result;
        return {
          id,
          name: server.name,
          ip: server.public_net?.ipv4?.ip || "Sin IP",
          status: server.status,
          type: srv.server_type || "Desconocido",
          gpu: srv.gpu_type || "N/A",
          project,
        };
      })
    );

    const valid = results.filter(Boolean);

    console.log(`✅ Servidores válidos encontrados: ${valid.length}`);

    // 5️⃣ Respuesta final
    return NextResponse.json({
      servers: valid,
      total: valid.length,
      email,
    });
  } catch (err) {
    console.error("💥 Error general en /api/servers:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
