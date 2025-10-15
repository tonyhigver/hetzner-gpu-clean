export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// Conexión Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Tokens Hetzner
const hetznerProjects = [
  { name: "PROJECT1", token: process.env.HETZNER_API_TOKEN_PROJECT1 },
  { name: "PROJECT2", token: process.env.HETZNER_API_TOKEN_PROJECT2 },
  { name: "PROJECT3", token: process.env.HETZNER_API_TOKEN_PROJECT3 },
  { name: "PROJECT4", token: process.env.HETZNER_API_TOKEN_PROJECT4 },
].filter((p) => !!p.token);

// Obtener servidores de Hetzner
async function fetchHetznerServers() {
  let allServers: any[] = [];
  for (const { name, token } of hetznerProjects) {
    try {
      console.log(`🔹 Consultando servidores del proyecto: ${name}`);
      const res = await axios.get("https://api.hetzner.cloud/v1/servers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`   ✅ Servidores recibidos: ${res.data.servers?.length || 0}`);
      if (res.data.servers) allServers = allServers.concat(res.data.servers.map((s: any) => ({ ...s, project: name, token })));
    } catch (err) {
      console.error(`❌ Error obteniendo servidores de ${name}:`, err);
    }
  }
  console.log(`🔹 Total servidores Hetzner obtenidos: ${allServers.length}`);
  return allServers;
}

// Sincronizar Hetzner ↔ Supabase
async function syncServers() {
  console.log("🔄 Iniciando sincronización Hetzner ↔ Supabase...");

  const hetznerServers = await fetchHetznerServers();
  if (!hetznerServers.length) {
    console.warn("⚠️ No se obtuvieron servidores de Hetzner");
    return [];
  }

  const { data: dbServers, error } = await supabase.from("user_servers").select("*");
  if (error) {
    console.error("❌ Error leyendo Supabase:", error);
    return [];
  }
  console.log(`📦 Servidores actuales en Supabase: ${dbServers.length}`);

  const hetznerIds = hetznerServers.map((s) => s.id.toString());

  // Eliminar servidores inactivos
  for (const server of dbServers) {
    if (!hetznerIds.includes(server.hetzner_server_id)) {
      console.log(`🗑️ Eliminando servidor inactivo: ${server.hetzner_server_id}`);
      await supabase.from("user_servers").delete().eq("id", server.id);
    }
  }

  // Insertar/Actualizar servidores activos
  for (const server of hetznerServers) {
    const existing = dbServers.find((s) => s.hetzner_server_id === server.id.toString());
    const serverData: any = {
      hetzner_server_id: server.id.toString(),
      server_name: server.name,
      status: server.status,
      gpu_type: server.labels?.gpu || null,
      ip: server.public_net?.ipv4?.ip || null,
      location: server.location?.name || null,
      project: server.project,
      user_id: existing?.user_id || null, // mantener user_id si ya existía
    };

    if (existing) {
      await supabase.from("user_servers").update(serverData).eq("id", existing.id);
      console.log(`🟢 Actualizado servidor: ${server.name}`);
    } else {
      await supabase.from("user_servers").insert(serverData);
      console.log(`🆕 Insertado nuevo servidor: ${server.name}`);
    }
  }

  console.log("✅ Sincronización completada correctamente.");
  return hetznerServers;
}

// Route principal
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");
    if (!rawEmail) {
      console.warn("⚠️ Falta el parámetro email en la request");
      return NextResponse.json({ error: "Falta email" }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    console.log(`📧 Email recibido: ${email}`);

    // Ejecutar sincronización
    const hetznerServers = await syncServers();

    // Traer servidores filtrados por user_id
    const { data: userServers, error } = await supabase
      .from("user_servers")
      .select("*")
      .eq("user_id", email);

    if (error) {
      console.error("❌ Error obteniendo servidores del usuario:", error);
      throw error;
    }

    console.log(`📦 Servidores filtrados para ${email}: ${userServers?.length || 0}`);

    // Log de los nombres de los servidores que se van a devolver
    if (userServers?.length) {
      console.log("📄 Servidores del usuario:");
      userServers.forEach((s) => console.log(`   - ${s.server_name} (${s.status})`));
    }

    return NextResponse.json({
      servers: userServers || [],
      total: userServers?.length || 0,
      email,
    });
  } catch (err) {
    console.error("💥 Error en /api/get-user-servers:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
