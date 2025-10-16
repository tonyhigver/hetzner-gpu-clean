export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

/* ────────────────────────────────────────────────
   🔧 CONFIGURACIÓN INICIAL
──────────────────────────────────────────────── */
console.log("==============================================");
console.log("🚀 Iniciando /api/get-user-servers route...");
console.log("🔹 NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅" : "❌");
console.log("🔹 SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅" : "❌");
console.log("🔹 Tokens Hetzner detectados:");
console.log({
  PROJECT1: process.env.HETZNER_API_TOKEN_PROJECT1 ? "✅" : "❌",
  PROJECT2: process.env.HETZNER_API_TOKEN_PROJECT2 ? "✅" : "❌",
  PROJECT3: process.env.HETZNER_API_TOKEN_PROJECT3 ? "✅" : "❌",
  PROJECT4: process.env.HETZNER_API_TOKEN_PROJECT4 ? "✅" : "❌",
});
console.log("==============================================");

/* ────────────────────────────────────────────────
   🔗 CONEXIÓN SUPABASE
──────────────────────────────────────────────── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ────────────────────────────────────────────────
   💡 TOKENS HETZNER
──────────────────────────────────────────────── */
const hetznerProjects = [
  { name: "PROJECT1", token: process.env.HETZNER_API_TOKEN_PROJECT1 },
  { name: "PROJECT2", token: process.env.HETZNER_API_TOKEN_PROJECT2 },
  { name: "PROJECT3", token: process.env.HETZNER_API_TOKEN_PROJECT3 },
  { name: "PROJECT4", token: process.env.HETZNER_API_TOKEN_PROJECT4 },
].filter((p) => !!p.token);

/* ────────────────────────────────────────────────
   📡 OBTENER TODOS LOS SERVIDORES HETZNER
──────────────────────────────────────────────── */
async function fetchHetznerServers() {
  const allServers: any[] = [];

  for (const { name, token } of hetznerProjects) {
    try {
      const res = await axios.get("https://api.hetzner.cloud/v1/servers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const servers = res.data.servers || [];

      console.log(`📡 ${name}: ${servers.length} servidores obtenidos`);

      servers.forEach((s: any) => {
        allServers.push({
          id: s.id.toString(),
          name: s.name,
          status: s.status,
          gpu: s.labels?.gpu || null,
          ip: s.public_net?.ipv4?.ip || null,
          location: s.datacenter?.location?.name || null,
          project: name,
        });
      });
    } catch (err: any) {
      console.error(`❌ Error obteniendo servidores de ${name}:`, err.message);
    }
  }

  console.log(`🔹 Total global de Hetzner: ${allServers.length}`);
  return allServers;
}

/* ────────────────────────────────────────────────
   🧹 LIMPIAR DUPLICADOS EN SUPABASE
──────────────────────────────────────────────── */
async function cleanDuplicateServers() {
  const { data: allRows, error } = await supabase.from("user_servers").select("*");
  if (error) {
    console.error("❌ Error al leer Supabase:", error);
    return;
  }

  const seen = new Set<string>();
  const duplicates: number[] = [];

  for (const row of allRows) {
    if (seen.has(row.hetzner_server_id)) {
      duplicates.push(row.id);
    } else {
      seen.add(row.hetzner_server_id);
    }
  }

  if (duplicates.length > 0) {
    console.log(`🗑️ Eliminando ${duplicates.length} duplicados en Supabase...`);
    const { error: delError } = await supabase
      .from("user_servers")
      .delete()
      .in("id", duplicates);
    if (delError) console.error("❌ Error al eliminar duplicados:", delError);
    else console.log("✅ Duplicados eliminados correctamente.");
  } else {
    console.log("✅ No hay duplicados en Supabase.");
  }
}

/* ────────────────────────────────────────────────
   🔄 SINCRONIZAR HETZNER ↔ SUPABASE
──────────────────────────────────────────────── */
async function syncServers(userEmail: string) {
  console.log(`👤 Sincronizando para usuario: ${userEmail}`);

  // 🧹 Limpieza previa
  await cleanDuplicateServers();

  const hetznerServers = await fetchHetznerServers();
  if (!hetznerServers.length) {
    console.warn("⚠️ No hay servidores disponibles desde Hetzner.");
    return [];
  }

  // Leer servidores actuales
  const { data: dbServers, error: dbError } = await supabase.from("user_servers").select("*");
  if (dbError) {
    console.error("❌ Error leyendo Supabase:", dbError);
    return [];
  }

  const hetznerIds = hetznerServers.map((s) => s.id);

  // 🗑️ Eliminar servidores que ya no existen en Hetzner
  for (const srv of dbServers) {
    if (!hetznerIds.includes(srv.hetzner_server_id)) {
      console.log(`🗑️ Eliminando inactivo: ${srv.server_name} (${srv.hetzner_server_id})`);
      await supabase.from("user_servers").delete().eq("id", srv.id);
    }
  }

  // 🆕 Insertar o actualizar
  for (const server of hetznerServers) {
    const existing = dbServers.find((s) => s.hetzner_server_id === server.id);

    const data = {
      hetzner_server_id: server.id,
      server_name: server.name,
      status: server.status,
      gpu_type: server.gpu,
      ip: server.ip,
      location: server.location,
      project: server.project,
      user_id: existing?.user_id || userEmail,
    };

    if (existing) {
      await supabase.from("user_servers").update(data).eq("id", existing.id);
      console.log(`🟢 Actualizado: ${server.name}`);
    } else {
      await supabase.from("user_servers").insert(data);
      console.log(`🆕 Insertado: ${server.name}`);
    }
  }

  // 🧹 Limpieza final por seguridad
  await cleanDuplicateServers();

  console.log("✅ Sincronización completada.");
  return hetznerServers;
}

/* ────────────────────────────────────────────────
   🧩 HANDLER GET /api/get-user-servers
──────────────────────────────────────────────── */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");
    if (!rawEmail) {
      return NextResponse.json({ error: "Falta email" }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    const synced = await syncServers(email);

    const { data: userServers, error } = await supabase
      .from("user_servers")
      .select("*")
      .eq("user_id", email);

    if (error) throw error;

    console.log(`📦 ${userServers.length} servidores finales en Supabase.`);

    return NextResponse.json({
      servers: userServers,
      total: userServers.length,
      synced: synced.length,
      email,
    });
  } catch (err: any) {
    console.error("💥 Error general:", err.message || err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
