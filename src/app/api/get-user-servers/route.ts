export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

/* ────────────────────────────────
   🔧 CONFIGURACIÓN INICIAL
────────────────────────────────── */
console.log("==============================================");
console.log("🚀 Iniciando /api/get-user-servers route (sin borrar tipos locales)...");
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
          hetzner_id: s.id.toString(),
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
   🔄 SINCRONIZACIÓN (sin borrar tipos)
────────────────────────────────── */
async function syncServers(userEmail: string) {
  console.log(`👤 Sincronizando servidores para usuario: ${userEmail}`);

  const hetznerServers = await fetchHetznerServers();

  if (!hetznerServers.length) {
    console.warn("⚠️ Hetzner no devolvió servidores.");
    return [];
  }

  // 🔍 Traer los registros existentes del usuario en Supabase
  const { data: existing, error: fetchError } = await supabase
    .from("user_servers")
    .select("*")
    .eq("user_id", userEmail);

  if (fetchError) {
    console.error("❌ Error leyendo Supabase:", fetchError);
    return [];
  }

  const updatedServers: any[] = [];

  for (const srv of hetznerServers) {
    const match = existing?.find((r) => String(r.hetzner_server_id) === String(srv.hetzner_id));

    const baseData = {
      hetzner_server_id: srv.hetzner_id,
      server_name: srv.name,
      status: srv.status,
      ip: srv.ip ?? "—",
      location: srv.location ?? "—",
      project: srv.project ?? "—",
      user_id: userEmail,
    };

    if (match) {
      // 🧠 Mantiene los valores locales (serverType, gpuType)
      const updatedData = {
        ...baseData,
        gpu_type: match.gpu_type || srv.gpu || "—",
        server_type: match.server_type || "—",
      };

      const { error: updateError } = await supabase
        .from("user_servers")
        .update(updatedData)
        .eq("id", match.id);

      if (updateError) {
        console.error(`⚠️ Error actualizando ${srv.name}:`, updateError.message);
      } else {
        updatedServers.push(updatedData);
        console.log(`🔄 Actualizado: ${srv.name}`);
      }
    } else {
      // 🆕 Nuevo servidor → se inserta
      const insertData = {
        ...baseData,
        gpu_type: srv.gpu ?? "—",
        server_type: "—",
      };

      const { data: inserted, error: insertError } = await supabase
        .from("user_servers")
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        console.error(`❌ Error insertando ${srv.name}:`, insertError.message);
      } else {
        updatedServers.push(inserted);
        console.log(`🆕 Insertado: ${srv.name}`);
      }
    }
  }

  console.log(`📦 ${updatedServers.length} servidores sincronizados (sin eliminar los tipos locales).`);
  console.log("✅ Sincronización completada.");
  return updatedServers;
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
