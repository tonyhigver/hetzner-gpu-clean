export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

/* ────────────────────────────────
   🔧 CONFIGURACIÓN
────────────────────────────────── */
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
  const allServers: string[] = [];

  for (const { name, token } of hetznerProjects) {
    try {
      const res = await axios.get("https://api.hetzner.cloud/v1/servers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const servers = res.data.servers || [];
      for (const s of servers) {
        allServers.push(s.id.toString());
      }
    } catch (err: any) {
      console.error(`❌ Error obteniendo servidores de ${name}:`, err.message);
    }
  }

  return allServers;
}

/* ────────────────────────────────
   🔄 SINCRONIZACIÓN SEGURA
────────────────────────────────── */
async function syncUserServers(userEmail: string) {
  console.log("🔍 Buscando servidores en Supabase para:", userEmail);

  // 1️⃣ Obtener todos los servidores del usuario en Supabase
  const { data: dbServers, error } = await supabase
    .from("user_servers")
    .select("*")
    .eq("user_email", userEmail); // 🔧 CORREGIDO: antes era user_id

  if (error) {
    console.error("❌ Error obteniendo servidores del usuario:", error.message);
    throw new Error(`Error obteniendo servidores del usuario: ${error.message}`);
  }

  console.log(`📦 Servidores obtenidos (${dbServers?.length || 0}):`, dbServers);

  if (!dbServers || dbServers.length === 0) return [];

  // 2️⃣ Obtener IDs actuales de Hetzner
  const hetznerIds = await fetchHetznerServers();
  console.log(`🧩 IDs actuales en Hetzner (${hetznerIds.length}):`, hetznerIds);

  // 3️⃣ Identificar los que ya no existen
  const serversToDelete = dbServers.filter(
    (s) => !hetznerIds.includes(s.hetzner_server_id)
  );

  // 4️⃣ Eliminar solo los que no existen en Hetzner
  for (const s of serversToDelete) {
    const { error: delError } = await supabase
      .from("user_servers")
      .delete()
      .eq("id", s.id);

    if (delError)
      console.error(`❌ Error eliminando servidor ${s.server_name}:`, delError.message);
    else
      console.log(`🗑️ Eliminado servidor no existente en Hetzner: ${s.server_name}`);
  }

  // 5️⃣ Devolver solo los activos
  const activeServers = dbServers.filter((s) =>
    hetznerIds.includes(s.hetzner_server_id)
  );

  console.log(`✅ Servidores activos (${activeServers.length}):`, activeServers);

  return activeServers;
}

/* ────────────────────────────────
   🧩 HANDLER GET
────────────────────────────────── */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");

    if (
      !rawEmail ||
      rawEmail === "undefined" ||
      rawEmail === "null" ||
      !rawEmail.includes("@")
    ) {
      console.warn("🚫 Petición rechazada: email inválido →", rawEmail);
      return NextResponse.json({ servers: [], error: "Email inválido" }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    console.log(`📩 Sincronizando servidores para: ${email}`);

    const servers = await syncUserServers(email);

    return NextResponse.json({ servers, total: servers.length, email });
  } catch (err: any) {
    console.error("💥 Error general en get-user-servers:", err.message || err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
