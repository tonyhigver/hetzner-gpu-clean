export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// 🧩 Log inicial: variables de entorno críticas
console.log("🔧 Cargando configuración inicial...");
console.log("🔹 SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Definida" : "❌ NO definida");
console.log("🔹 SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Definida" : "❌ NO definida");
console.log("🔹 Tokens Hetzner detectados:");
console.log({
  PROJECT1: process.env.HETZNER_API_TOKEN_PROJECT1 ? "✅" : "❌",
  PROJECT2: process.env.HETZNER_API_TOKEN_PROJECT2 ? "✅" : "❌",
  PROJECT3: process.env.HETZNER_API_TOKEN_PROJECT3 ? "✅" : "❌",
  PROJECT4: process.env.HETZNER_API_TOKEN_PROJECT4 ? "✅" : "❌",
});

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

console.log(`🧩 Proyectos Hetzner activos detectados: ${hetznerProjects.length}`);

// 🔹 Obtener servidores de Hetzner
async function fetchHetznerServers() {
  console.log("🚀 Iniciando fetchHetznerServers()...");
  let allServers: any[] = [];

  if (hetznerProjects.length === 0) {
    console.warn("⚠️ No hay proyectos Hetzner configurados (verifica variables de entorno)");
    return [];
  }

  for (const { name, token } of hetznerProjects) {
    console.log(`📡 Consultando servidores del proyecto: ${name}`);
    try {
      const res = await axios.get("https://api.hetzner.cloud/v1/servers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`   ✅ Servidores recibidos de ${name}: ${res.data.servers?.length || 0}`);
      if (res.data.servers) {
        const serversWithProject = res.data.servers.map((s: any) => ({
          ...s,
          project: name,
          token,
        }));
        allServers = allServers.concat(serversWithProject);
      }
    } catch (err: any) {
      console.error(`❌ Error obteniendo servidores de ${name}:`, err.response?.data || err.message);
    }
  }

  console.log(`🔹 Total servidores Hetzner obtenidos globalmente: ${allServers.length}`);
  return allServers;
}

// 🔹 Sincronizar Hetzner ↔ Supabase
async function syncServers(userEmail: string) {
  console.log("🔄 Iniciando syncServers()...");
  console.log(`👤 Usuario para sincronización: ${userEmail}`);

  const hetznerServers = await fetchHetznerServers();
  console.log(`📊 Servidores obtenidos desde Hetzner: ${hetznerServers.length}`);

  if (!hetznerServers.length) {
    console.warn("⚠️ No se obtuvieron servidores desde Hetzner → no se aplicarán cambios");
    return [];
  }

  console.log("📥 Leyendo servidores existentes desde Supabase...");
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
      console.log(`🗑️ Eliminando servidor inactivo: ${server.hetzner_server_id} (${server.server_name})`);
      const { error: delError } = await supabase.from("user_servers").delete().eq("id", server.id);
      if (delError) console.error("   ❌ Error al eliminar:", delError);
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
      user_id: existing?.user_id || userEmail,
    };

    if (existing) {
      console.log(`🟢 Actualizando servidor existente: ${server.name}`);
      const { error: updateError } = await supabase.from("user_servers").update(serverData).eq("id", existing.id);
      if (updateError) console.error("   ❌ Error al actualizar:", updateError);
    } else {
      console.log(`🆕 Insertando nuevo servidor: ${server.name}`);
      const { error: insertError } = await supabase.from("user_servers").insert(serverData);
      if (insertError) console.error("   ❌ Error al insertar:", insertError);
    }
  }

  console.log("✅ Sincronización completada correctamente.");
  return hetznerServers;
}

// Route principal
export async function GET(req: Request) {
  console.log("📨 [GET] /api/get-user-servers ejecutado");
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");
    if (!rawEmail) {
      console.warn("⚠️ Falta el parámetro 'email' en la request");
      return NextResponse.json({ error: "Falta email" }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    console.log(`📧 Email recibido en query: ${email}`);

    // Sincronización principal
    console.log("🧩 Lanzando sincronización...");
    const hetznerServers = await syncServers(email);
    console.log(`📈 Resultado: ${hetznerServers.length} servidores sincronizados desde Hetzner`);

    // Obtener servidores del usuario desde Supabase
    console.log(`📤 Consultando servidores del usuario '${email}' desde Supabase...`);
    const { data: userServers, error } = await supabase
      .from("user_servers")
      .select("*")
      .eq("user_id", email);

    if (error) {
      console.error("❌ Error obteniendo servidores del usuario:", error);
      throw error;
    }

    console.log(`📦 Servidores filtrados para ${email}: ${userServers?.length || 0}`);
    if (userServers?.length) {
      console.log("📄 Servidores del usuario:");
      userServers.forEach((s) => console.log(`   - ${s.server_name} (${s.status})`));
    } else {
      console.log("⚠️ Ningún servidor asociado al usuario.");
    }

    return NextResponse.json({
      servers: userServers || [],
      total: userServers?.length || 0,
      email,
    });
  } catch (err: any) {
    console.error("💥 Error en /api/get-user-servers:", err.message || err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
