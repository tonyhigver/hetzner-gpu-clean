export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

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

async function fetchHetznerServers() {
  const allServers: any[] = [];
  for (const { name, token } of hetznerProjects) {
    try {
      const res = await axios.get("https://api.hetzner.cloud/v1/servers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const servers = res.data.servers || [];
      const enriched = servers.map((s: any) => ({
        ...s,
        project: name,
      }));
      allServers.push(...enriched);
    } catch (err: any) {
      console.error(`❌ Error en proyecto ${name}:`, err.response?.data || err.message);
    }
  }
  console.log(`📡 Total global de servidores Hetzner: ${allServers.length}`);
  return allServers;
}

async function syncServers(userEmail: string) {
  console.log(`🔁 Sincronizando servidores para ${userEmail}`);

  const hetznerServers = await fetchHetznerServers();
  if (!hetznerServers.length) return [];

  const { data: dbServers } = await supabase.from("user_servers").select("*");

  for (const server of hetznerServers) {
    const hetzId = server.id.toString();
    const project = server.project || null;

    const existing = dbServers?.find(
      (s) => s.hetzner_server_id === hetzId && s.project === project
    );

    const serverData = {
      hetzner_server_id: hetzId,
      server_name: server.name,
      status: server.status,
      gpu_type: server.labels?.gpu || null,
      ip: server.public_net?.ipv4?.ip || null,
      project,
      location: server.datacenter?.location?.name || null,
      user_id: userEmail, // 🔥 aseguramos siempre asignar el usuario
    };

    if (existing) {
      await supabase.from("user_servers").update(serverData).eq("id", existing.id);
      console.log(`🟢 Actualizado: ${server.name} (${project || "sin proyecto"})`);
    } else {
      await supabase.from("user_servers").insert(serverData);
      console.log(`🆕 Insertado: ${server.name} (${project || "sin proyecto"})`);
    }
  }

  // 🔹 Después de sincronizar, devolvemos todos los servidores del usuario
  const { data: finalData } = await supabase
    .from("user_servers")
    .select("*")
    .eq("user_id", userEmail);

  console.log(`📦 ${finalData?.length || 0} servidores finales en Supabase.`);
  return finalData || [];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) return NextResponse.json({ error: "Falta email" }, { status: 400 });

    const servers = await syncServers(email.trim().toLowerCase());
    return NextResponse.json({ servers });
  } catch (err: any) {
    console.error("💥 Error en get-user-servers:", err.message || err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
