export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

async function fetchHetznerServer(serverId: string) {
  console.log(`🔍 Inicio de fetchHetznerServer para ID: ${serverId}`);

  for (const { name, token } of hetznerProjects) {
    try {
      console.log(`🛰 Consultando proyecto ${name} con token ${token?.slice(0,6)}...`);

      const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      console.log(`📥 Respuesta status: ${res.status} del proyecto ${name}`);

      if (res.ok) {
        const data = await res.json();
        console.log(`✅ Servidor ${serverId} encontrado en ${name}: ${data.server.name}`);
        return { server: data.server, project: name };
      }

      if (res.status === 404) {
        console.log(`⚠️ Servidor ${serverId} no existe en ${name}`);
        continue;
      }

      if (res.status === 401) {
        console.log(`🚫 Token inválido para ${name}`);
        continue;
      }

      const text = await res.text();
      console.error(`❌ Error ${res.status} al consultar ${name}:`, text);

    } catch (err) {
      console.error(`💥 Error al consultar ${name}:`, err);
    }
  }

  console.log(`❌ Servidor ${serverId} no encontrado en ningún proyecto`);
  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");

    console.log("📩 Email recibido:", rawEmail);

    if (!rawEmail) {
      console.warn("⚠️ Falta el parámetro email");
      return NextResponse.json({ error: "Falta el parámetro email" }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    console.log(`📧 Email normalizado: "${email}"`);

    // SELECT completo desde Supabase
    const { data: userServers, error } = await supabase
      .from("user_servers")
      .select("*")
      .eq("user_id", email);

    if (error) {
      console.error("💥 Error al consultar Supabase:", error);
      throw error;
    }

    console.log("🧾 Servidores obtenidos de Supabase:", JSON.stringify(userServers, null, 2));

    if (!userServers || userServers.length === 0) {
      console.log("⚠️ No hay servidores registrados para este usuario");
      return NextResponse.json({ servers: [] });
    }

    const validServers = [];
    const removedServers = [];

    for (const srv of userServers) {
      console.log("🟢 Procesando registro de Supabase:", srv);

      const id = String(srv.hetzner_server_id);
      if (!id || id === "null" || id === "undefined") {
        console.warn(`⚠️ ID inválido para registro: ${JSON.stringify(srv)}`);
        continue;
      }

      console.log(`🔎 Consultando Hetzner para servidor ${id}...`);
      const result = await fetchHetznerServer(id);

      if (!result) {
        console.log(`🧹 Intentando eliminar registro de Supabase para ID ${id}`);
        const { data: confirm, error: confirmErr } = await supabase
          .from("user_servers")
          .select("hetzner_server_id")
          .eq("hetzner_server_id", id)
          .eq("user_id", email)
          .maybeSingle();

        if (confirmErr) {
          console.error(`💥 Error confirmando existencia en Supabase para ${id}:`, confirmErr);
        } else if (!confirm) {
          console.log(`⚪ Registro ${id} ya no existe en Supabase`);
        } else {
          console.warn(`🧹 Eliminando registro obsoleto ${id} de Supabase`);
          const { error: deleteErr } = await supabase
            .from("user_servers")
            .delete()
            .eq("hetzner_server_id", id)
            .eq("user_id", email);

          if (deleteErr) {
            console.error(`💥 Error al eliminar ${id}:`, deleteErr);
          } else {
            console.log(`✅ Registro ${id} eliminado correctamente`);
            removedServers.push(id);
          }
        }
        continue;
      }

      const { server, project } = result;

      console.log(`✅ Servidor válido encontrado: ${server.name} (${id}) en proyecto ${project}`);

      validServers.push({
        id,
        name: server.name,
        ip: server.public_net?.ipv4?.ip || "No asignada",
        status: server.status,
        project,
        type: srv.server_type || "Desconocido",
        gpu: srv.gpu_type || "N/A",
      });
    }

    console.log(`📊 Total servidores válidos: ${validServers.length}`);
    if (removedServers.length > 0) {
      console.log(`🧹 Total eliminados: ${removedServers.join(", ")}`);
    }

    return NextResponse.json({
      servers: validServers,
      removed: removedServers,
      total: userServers.length,
    });

  } catch (err) {
    console.error("💥 Error general en get-user-servers:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
