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
  if (hetznerProjects.length === 0) return [];

  for (const { name, token } of hetznerProjects) {
    try {
      const res = await axios.get("https://api.hetzner.cloud/v1/servers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const servers = res.data.servers || [];
      if (servers.length > 0) {
        const enriched = servers.map((s: any) => ({
          ...s,
          project: name,
          token,
        }));
        allServers.push(...enriched);
      }
    } catch (err: any) {
      console.error(`❌ Error en proyecto ${name}:`, err.response?.data || err.message);
    }
  }

  console.log(`🔹 Total global de servidores Hetzner: ${allServers.length}`);
  return allServers;
}

/* ────────────────────────────────────────────────
   🧹 LIMPIAR DUPLICADOS EN SUPABASE
──────────────────────────────────────────────── */
async function cleanDuplicateServers() {
  console.log("🧹 Buscando duplicados en user_servers...");
  const { data: allRows, error } = await supabase.from("user_servers").select("*");
  if (error) {
    console.error("❌ Error leyendo Supabase:", error);
    return;
  }

  const seen = new Map<string, number>();
  const duplicates: number[] = [];

  for (const row of allRows) {
    if (seen.has(row.hetzner_server_id)) {
      duplicates.push(row.id); // mantener solo la primera ocurrencia
    } else {
      seen.set(row.hetzner_server_id, row.id);
    }
  }

  if (duplicates.length > 0) {
    console.log(`🗑️ Eliminando ${duplicates.length} duplicados en Supabase...`);
    const { error: delError } = await supabase
      .from("user_servers")
      .delete()
      .in("id", duplicates);
    if (delError) console.error("❌ Error al eliminar duplicados:", delError);
    else console.log("✅ Duplicados eliminados con éxito");
  } else {
    console.log("✅ No se encontraron duplicados.");
  }
}

/* ────────────────────────────────────────────────
   🔄 SINCRONIZAR HETZNER ↔ SUPABASE
──────────────────────────────────────────────── */
async function syncServers(userEmail: string) {
  console.log(`👤 Sincronizando para usuario: ${userEmail}`);

  const hetznerServers = await fetchHetznerServers();
  if (!hetznerServers.length) {
    console.warn("⚠️ No hay servidores disponibles desde Hetzner.");
    return [];
  }

  const { data: dbServers, error: dbError } = await supabase.from("user_servers").select("*");
  if (dbError) {
    console.error("❌ Error leyendo Supabase:", dbError);
    return [];
  }

  const hetznerIds = hetznerServers.map((s) => s.id.toString());

  // 🔹 Eliminar registros de Supabase que ya no existen en Hetzner
  for (const srv of dbServers) {
    if (!hetznerIds.includes(srv.hetzner_server_id)) {
      console.log(`🗑️ Eliminando inactivo: ${srv.server_name} (${srv.hetzner_server_id})`);
      await supabase.from("user_servers").delete().eq("id", srv.id);
    }
  }

  // 🔹 Insertar o actualizar registros
  for (const server of hetznerServers) {
    const idStr = server.id.toString();
    const existing = dbServers.find((s) => s.hetzner_server_id === idStr);

    const serverData: any = {
      hetzner_server_id: idStr,
      server_name: server.name,
      status: server.status,
      gpu_type: server.labels?.gpu || null,
      ip: server.public_net?.ipv4?.ip || null,
      project: server.project,
      location: server.datacenter?.location?.name || null,
      user_id: existing?.user_id || userEmail,
    };

    if (existing) {
      await supabase.from("user_servers").update(serverData).eq("id", existing.id);
      console.log(`🟢 Actualizado: ${server.name}`);
    } else {
      await supabase.from("user_servers").insert(serverData);
      console.log(`🆕 Insertado: ${server.name}`);
    }
  }

  // 🧹 Limpiar duplicados al final
  await cleanDuplicateServers();

  console.log("✅ Sincronización terminada con éxito.");
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

    const { data: userServers, error: userError } = await supabase
      .from("user_servers")
      .select("*")
      .eq("user_id", email);

    if (userError) throw userError;

    return NextResponse.json({
      servers: userServers || [],
      total: userServers?.length || 0,
      synced: synced.length,
      email,
    });
  } catch (err: any) {
    console.error("💥 Error general:", err.message || err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
