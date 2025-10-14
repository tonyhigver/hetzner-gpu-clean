// app/api/get-user-servers/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --- 🔍 Verificar variables de entorno ---
console.log("🧩 Verificando variables de entorno...");
[
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "HETZNER_API_TOKEN_PROJECT1",
  "HETZNER_API_TOKEN_PROJECT2",
  "HETZNER_API_TOKEN_PROJECT3",
  "HETZNER_API_TOKEN_PROJECT4",
].forEach((v) => console.log(`🔑 ${v}:`, process.env[v] ? "✅ OK" : "❌ NO EXISTE"));

// --- Inicializar Supabase ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Mapa de tokens por proyecto ---
const hetznerProjects = {
  project1: process.env.HETZNER_API_TOKEN_PROJECT1!,
  project2: process.env.HETZNER_API_TOKEN_PROJECT2!,
  project3: process.env.HETZNER_API_TOKEN_PROJECT3!,
  project4: process.env.HETZNER_API_TOKEN_PROJECT4!,
};

// --- 🔧 Probar todos los tokens en paralelo ---
async function fetchHetznerServer(serverId: string) {
  const tries = Object.entries(hetznerProjects).map(async ([project, token]) => {
    try {
      const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const { server } = await res.json();
        console.log(`✅ Servidor ${serverId} encontrado en ${project}`);
        return { server, project };
      }

      if (res.status === 404) {
        console.warn(`⚠️ Servidor ${serverId} no encontrado en ${project}`);
        return null;
      }

      console.error(`❌ Error ${res.status} al consultar ${project}:`, await res.text());
      return null;
    } catch (err) {
      console.error(`💥 Error al consultar ${project}:`, err);
      return null;
    }
  });

  const results = await Promise.all(tries);
  return results.find((r) => r !== null) || null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      console.error("❌ Falta el parámetro email");
      return NextResponse.json({ error: "Falta el parámetro email" }, { status: 400 });
    }

    console.log(`📨 Consultando servidores para usuario: ${email}`);

    const { data: userServers, error } = await supabase
      .from("user_servers")
      .select("*")
      .eq("user_id", email);

    if (error) throw error;
    if (!userServers || userServers.length === 0) {
      console.warn("⚠️ No se encontraron servidores para este usuario");
      return NextResponse.json({ servers: [] });
    }

    const validServers = [];

    for (const srv of userServers) {
      console.log(`🌐 Verificando servidor Hetzner ID: ${srv.hetzner_server_id}`);

      const result = await fetchHetznerServer(srv.hetzner_server_id);

      if (!result) {
        console.warn(`🧹 Eliminando de Supabase: servidor ${srv.hetzner_server_id} no existe en Hetzner`);
        await supabase.from("user_servers").delete().eq("hetzner_server_id", srv.hetzner_server_id);
        continue;
      }

      const { server, project } = result;

      // --- Actualiza el campo hetzner_project si es necesario ---
      if (!srv.hetzner_project || srv.hetzner_project !== project) {
        await supabase
          .from("user_servers")
          .update({ hetzner_project: project })
          .eq("hetzner_server_id", srv.hetzner_server_id);
        console.log(`🧠 Campo hetzner_project actualizado → ${project}`);
      }

      validServers.push({
        id: srv.hetzner_server_id,
        name: server.name,
        type: srv.server_type || "Desconocido",
        gpu: srv.gpu_type || "N/A",
        ip: server.public_net?.ipv4?.ip || srv.ip || "No asignada",
        status: server.status,
        project,
      });
    }

    console.log(`✅ ${validServers.length} servidores válidos encontrados`);
    return NextResponse.json({ servers: validServers });
  } catch (err) {
    console.error("💥 Error en get-user-servers:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
