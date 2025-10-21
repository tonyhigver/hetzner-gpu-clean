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
  const allServers: any[] = [];

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
   🔄 SINCRONIZACIÓN: PURGA SOLO LOS NO EXISTENTES
────────────────────────────────── */
async function syncUserServers(userEmail: string) {
  // 1️⃣ Obtener todos los servidores del usuario en Supabase
  const { data: dbServers, error } = await supabase
    .from("user_servers")
    .select("*")
    .eq("user_id", userEmail);

  if (error) throw new Error(`Error obteniendo servidores del usuario: ${error.message}`);

  if (!dbServers || dbServers.length === 0) return [];

  // 2️⃣ Obtener todos los server_id de Hetzner
  const hetznerIds = await fetchHetznerServers();

  // 3️⃣ Comparar y eliminar los que no existen
  const serversToDelete = dbServers.filter(
    (s) => !hetznerIds.includes(s.hetzner_server_id)
  );

  for (const s of serversToDelete) {
    const { error: delError } = await supabase
      .from("user_servers")
      .delete()
      .eq("id", s.id);

    if (delError) console.error(`❌ Error eliminando servidor ${s.server_name}:`, delError.message);
    else console.log(`🗑️ Eliminado servidor no existente en Hetzner: ${s.server_name}`);
  }

  // 4️⃣ Devolver los servidores que siguen activos
  const activeServers = dbServers.filter(
    (s) => hetznerIds.includes(s.hetzner_server_id)
  );

  return activeServers;
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
    const servers = await syncUserServers(email);

    return NextResponse.json({ servers, total: servers.length, email });
  } catch (err: any) {
    console.error("💥 Error general:", err.message || err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
