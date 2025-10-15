export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

/* ────────────────────────────────────────────────
   🔧 CONFIGURACIÓN INICIAL Y LOGS DE ENTORNO
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

console.log(`🧩 Proyectos Hetzner activos: ${hetznerProjects.length}`);
hetznerProjects.forEach((p) => console.log(`   → ${p.name}`));

/* ────────────────────────────────────────────────
   📡 FUNCIÓN: Obtener todos los servidores Hetzner
──────────────────────────────────────────────── */
async function fetchHetznerServers() {
  console.log("────────────── fetchHetznerServers() ──────────────");
  const allServers: any[] = [];

  if (hetznerProjects.length === 0) {
    console.warn("⚠️ No hay proyectos Hetzner configurados (variables de entorno vacías)");
    return [];
  }

  for (const { name, token } of hetznerProjects) {
    console.log(`📡 Consultando servidores del proyecto: ${name}`);
    try {
      const res = await axios.get("https://api.hetzner.cloud/v1/servers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const count = res.data.servers?.length || 0;
      console.log(`   ✅ ${count} servidores recibidos desde ${name}`);

      if (res.data.servers && count > 0) {
        const enriched = res.data.servers.map((s: any) => ({
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
  console.log("────────────────────────────────────────────────────");
  return allServers;
}

/* ────────────────────────────────────────────────
   🔄 FUNCIÓN: Sincronizar Hetzner ↔ Supabase
──────────────────────────────────────────────── */
async function syncServers(userEmail: string) {
  console.log("────────────── syncServers() ──────────────");
  console.log(`👤 Usuario objetivo: ${userEmail}`);

  const hetznerServers = await fetchHetznerServers();
  console.log(`📊 Total obtenido desde Hetzner: ${hetznerServers.length}`);

  if (!hetznerServers.length) {
    console.warn("⚠️ No hay servidores disponibles desde Hetzner.");
    return [];
  }

  console.log("📥 Leyendo servidores actuales de Supabase...");
  const { data: dbServers, error: dbError } = await supabase.from("user_servers").select("*");

  if (dbError) {
    console.error("❌ Error leyendo Supabase:", dbError);
    return [];
  }

  console.log(`📦 Servidores en Supabase actualmente: ${dbServers.length}`);
  const hetznerIds = hetznerServers.map((s) => s.id.toString());

  // 🔹 Eliminar servidores que ya no existen
  for (const server of dbServers) {
    if (!hetznerIds.includes(server.hetzner_server_id)) {
      console.log(`🗑️ Eliminando inactivo: ${server.server_name} (${server.hetzner_server_id})`);
      const { error: delError } = await supabase.from("user_servers").delete().eq("id", server.id);
      if (delError) console.error("   ❌ Error al eliminar:", delError);
    }
  }

  // 🔹 Insertar o actualizar servidores activos
  for (const server of hetznerServers) {
    const existing = dbServers.find((s) => s.hetzner_server_id === server.id.toString());
    const serverData: any = {
      hetzner_server_id: server.id.toString(),
      server_name: server.name,
      status: server.status,
      gpu_type: server.labels?.gpu || null,
      ip: server.public_net?.ipv4?.ip || null,
      project: server.project,
      user_id: existing?.user_id || userEmail,
    };

    if (existing) {
      console.log(`🟢 Actualizando servidor existente: ${server.name}`);
      const { error: updateError } = await supabase
        .from("user_servers")
        .update(serverData)
        .eq("id", existing.id);
      if (updateError) console.error("   ❌ Error al actualizar:", updateError);
      else console.log("   ✅ Actualización completada");
    } else {
      console.log(`🆕 Insertando nuevo servidor: ${server.name}`);
      const { error: insertError } = await supabase.from("user_servers").insert(serverData);
      if (insertError) console.error("   ❌ Error al insertar:", insertError);
      else console.log("   ✅ Inserción completada");
    }
  }

  console.log("✅ Sincronización terminada con éxito.");
  console.log("───────────────────────────────────────────────");
  return hetznerServers;
}

/* ────────────────────────────────────────────────
   🧩 HANDLER: GET /api/get-user-servers
──────────────────────────────────────────────── */
export async function GET(req: Request) {
  console.log("📨 [GET] /api/get-user-servers ejecutado");

  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");
    console.log("🔍 Parámetro recibido:", rawEmail);

    if (!rawEmail) {
      console.warn("⚠️ Falta el parámetro 'email'");
      return NextResponse.json({ error: "Falta email" }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    console.log(`📧 Email normalizado: ${email}`);

    console.log("🔁 Llamando a syncServers()...");
    const synced = await syncServers(email);
    console.log(`📈 Resultado: ${synced.length} servidores sincronizados`);

    console.log("📤 Obteniendo servidores del usuario desde Supabase...");
    const { data: userServers, error: userError } = await supabase
      .from("user_servers")
      .select("*")
      .eq("user_id", email);

    if (userError) {
      console.error("❌ Error consultando Supabase:", userError);
      throw userError;
    }

    console.log(`📦 Servidores encontrados para ${email}: ${userServers?.length || 0}`);
    if (userServers?.length) {
      userServers.forEach((s) =>
        console.log(`   - ${s.server_name} [${s.status}] (${s.ip || "sin IP"})`)
      );
    } else {
      console.log("⚠️ Ningún servidor asociado al usuario actual.");
    }

    console.log("📤 Enviando respuesta JSON final...");
    return NextResponse.json({
      servers: userServers || [],
      total: userServers?.length || 0,
      email,
    });
  } catch (err: any) {
    console.error("💥 Error general en /api/get-user-servers:", err.message || err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
