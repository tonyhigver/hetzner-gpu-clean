export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

/* ────────────────────────────────
   🔧 CONFIGURACIÓN
────────────────────────────────── */
console.log("==============================================");
console.log("🚀 Iniciando /api/get-user-servers route...");
console.log("🔹 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅" : "❌");
console.log("🔹 Service Role Key:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅" : "❌");
console.log("🔹 Hetzner Tokens:");
console.log({
  PROJECT1: process.env.HETZNER_API_TOKEN_PROJECT1 ? "✅" : "❌",
  PROJECT2: process.env.HETZNER_API_TOKEN_PROJECT2 ? "✅" : "❌",
  PROJECT3: process.env.HETZNER_API_TOKEN_PROJECT3 ? "✅" : "❌",
  PROJECT4: process.env.HETZNER_API_TOKEN_PROJECT4 ? "✅" : "❌",
});
console.log("==============================================");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const hetznerProjects = [
  { name: "PROJECT1", token: process.env.HETZNER_API_TOKEN_PROJECT1 },
  { name: "PROJECT2", token: process.env.HETZNER_API_TOKEN_PROJECT2 },
  { name: "PROJECT3", token: process.env.HETZNER_API_TOKEN_PROJECT3 },
  { name: "PROJECT4", token: process.env.HETZNER_API_TOKEN_PROJECT4 },
].filter((p) => !!p.token);

/* ────────────────────────────────
   📡 OBTENER SERVIDORES DE HETZNER
────────────────────────────────── */
async function fetchHetznerServers() {
  const allServers: any[] = [];

  for (const { name, token } of hetznerProjects) {
    try {
      const res = await axios.get("https://api.hetzner.cloud/v1/servers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const servers = res.data.servers || [];

      console.log(`📡 ${name}: ${servers.length} servidores obtenidos`);

      for (const s of servers) {
        allServers.push({
          id: s.id.toString(),
          name: s.name,
          status: s.status,
          gpu: s.labels?.gpu || null,
          ip: s.public_net?.ipv4?.ip || null,
          location: s.datacenter?.location?.name || null,
          project: name,
        });
      }
    } catch (err: any) {
      console.error(`❌ Error obteniendo servidores de ${name}:`, err.message);
    }
  }

  console.log(`🔹 Total global de Hetzner: ${allServers.length}`);
  return allServers;
}

/* ────────────────────────────────
   🔄 SINCRONIZACIÓN PURGA + INSERTA
────────────────────────────────── */
async function syncServers(userEmail: string) {
  console.log(`👤 Sincronizando para usuario: ${userEmail}`);

  const hetznerServers = await fetchHetznerServers();

  // 🔹 Purga completa del usuario antes de insertar
  const { error: delError } = await supabase.from("user_servers").delete().eq("user_id", userEmail);
  if (delError) console.error("❌ Error eliminando servidores antiguos:", delError);
  else console.log("🗑️ Servidores antiguos eliminados.");

  if (!hetznerServers.length) {
    console.warn("⚠️ Hetzner no devolvió servidores.");
    return [];
  }

  // 🆕 Insertar solo los servidores actuales de Hetzner
  const finalData: any[] = [];
  for (const server of hetznerServers) {
    const row = {
      hetzner_server_id: server.id,
      server_name: server.name,
      status: server.status,
      gpu_type: server.gpu ?? "—",
      ip: server.ip ?? "—",
      location: server.location ?? "—",
      project: server.project ?? "—",
      user_id: userEmail,
    };

    const { data, error } = await supabase.from("user_servers").insert(row).select().single();
    if (error) {
      console.error("❌ Error insertando servidor:", server.name, error);
    } else {
      finalData.push(data);
      console.log(`🆕 Insertado: ${server.name}`);
    }
  }

  console.log(`📦 ${finalData.length} servidores finales confirmados en Supabase.`);
  console.log("✅ Sincronización completada.");

  return finalData;
}

/* ────────────────────────────────
   🧩 HANDLER GET
────────────────────────────────── */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");

    if (!rawEmail)
      return NextResponse.json({ error: "Falta email" }, { status: 400 });

    const email = rawEmail.trim().toLowerCase();
    const syncedServers = await syncServers(email);

    return NextResponse.json({
      servers: syncedServers,
      total: syncedServers.length,
      email,
    });
  } catch (err: any) {
    console.error("💥 Error general:", err.message || err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
