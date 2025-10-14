export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --- Inicializar Supabase ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Definimos los tokens de Hetzner ---
const hetznerProjects = [
  { name: "PROJECT1", token: process.env.HETZNER_API_TOKEN_PROJECT1 },
  { name: "PROJECT2", token: process.env.HETZNER_API_TOKEN_PROJECT2 },
  { name: "PROJECT3", token: process.env.HETZNER_API_TOKEN_PROJECT3 },
  { name: "PROJECT4", token: process.env.HETZNER_API_TOKEN_PROJECT4 },
].filter((p) => !!p.token);

// --- Función que busca un servidor en todos los proyectos ---
async function fetchHetznerServer(serverId: string) {
  for (const { name, token } of hetznerProjects) {
    try {
      const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`✅ Servidor ${serverId} encontrado en ${name}: ${data.server.name}`);
        return { server: data.server, project: name };
      }

      if (res.status === 404) {
        console.log(`⚠️ Servidor ${serverId} no existe en ${name}`);
        continue;
      }

      if (res.status === 401) {
        console.log(`🚫 Token inválido para ${name}`);
        continue;
      }

      console.error(`❌ Error ${res.status} al consultar ${name}:`, await res.text());
    } catch (err) {
      console.error(`💥 Error al consultar ${name}:`, err);
    }
  }

  // No encontrado en ninguno
  return null;
}

// --- Handler principal ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");

    if (!rawEmail) {
      return NextResponse.json({ error: "Falta el parámetro email" }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    console.log(`📩 Petición recibida para email: "${email}"`);

    // --- Obtener servidores del usuario ---
    const { data: userServers, error } = await supabase
      .from("user_servers")
      .select("*")
      .eq("user_id", email);

    if (error) throw error;

    console.log("🧠 Data bruta de Supabase:", userServers);

    if (!userServers || userServers.length === 0) {
      console.log("⚠️ No hay servidores guardados en Supabase para este usuario");
      return NextResponse.json({ servers: [] });
    }

    // Filtrar registros válidos (IDs no vacíos y numéricos)
    const filtered = userServers.filter(
      (s) => s.hetzner_server_id && /^[0-9]+$/.test(String(s.hetzner_server_id))
    );

    console.log(
      `🧾 Servidores válidos encontrados (${filtered.length}):`,
      filtered.map((s) => s.hetzner_server_id)
    );

    const validServers = [];
    const removedServers = [];

    for (const srv of filtered) {
      const id = String(srv.hetzner_server_id);
      console.log(`🔍 Consultando Hetzner para servidor ${id}...`);

      const result = await fetchHetznerServer(id);

      if (!result) {
        console.warn(`🧹 Eliminando ${id}: no existe en ningún proyecto Hetzner`);
        await supabase.from("user_servers").delete().eq("hetzner_server_id", id);
        removedServers.push(id);
        continue;
      }

      const { server, project } = result;

      validServers.push({
        id,
        name: server.name,
        ip: server.public_net?.ipv4?.ip || "No asignada",
        status: server.status,
        project,
        type: srv.server_type || "Desconocido",
        gpu: srv.gpu_type || "N/A",
      });
    }

    console.log(`✅ ${validServers.length} servidores válidos encontrados`);
    if (removedServers.length > 0) {
      console.log(`🧹 Eliminados de Supabase: ${removedServers.join(", ")}`);
    }

    // Devuelve todos los encontrados, con nombres y proyectos
    return NextResponse.json({
      servers: validServers,
      removed: removedServers,
      total: filtered.length,
    });
  } catch (err) {
    console.error("💥 Error en get-user-servers:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
