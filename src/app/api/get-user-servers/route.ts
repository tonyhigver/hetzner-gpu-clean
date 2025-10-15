export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🔹 Lista de proyectos Hetzner
const hetznerProjects = [
  { name: "PROJECT1", token: process.env.HETZNER_API_TOKEN_PROJECT1 },
  { name: "PROJECT2", token: process.env.HETZNER_API_TOKEN_PROJECT2 },
  { name: "PROJECT3", token: process.env.HETZNER_API_TOKEN_PROJECT3 },
  { name: "PROJECT4", token: process.env.HETZNER_API_TOKEN_PROJECT4 },
].filter((p) => !!p.token);

// 🔍 Buscar un servidor por ID en todos los proyectos Hetzner
async function fetchHetznerServer(serverId: string) {
  console.log(`🔍 Inicio de fetchHetznerServer para ID: ${serverId}`);

  for (const { name, token } of hetznerProjects) {
    try {
      console.log(`🛰 Consultando proyecto ${name} con token ${token?.slice(0, 6)}...`);

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

// 🕓 Esperar hasta que el servidor esté "running"
async function waitForServerRunning(serverId: string, maxAttempts = 12, intervalMs = 5000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`⏳ Intento ${attempt} de ${maxAttempts} para ${serverId}`);
    const result = await fetchHetznerServer(serverId);

    if (!result) {
      console.log(`⚠️ Servidor ${serverId} no encontrado en este intento, esperando...`);
      await new Promise((res) => setTimeout(res, intervalMs));
      continue;
    }

    const { server } = result;
    console.log(`📊 Estado actual de ${serverId}: ${server.status}`);

    if (server.status === "running") {
      console.log(`✅ Servidor ${serverId} ya está running`);
      return result;
    }

    console.log(`⏳ Servidor ${serverId} todavía en ${server.status}, esperando...`);
    await new Promise((res) => setTimeout(res, intervalMs));
  }

  console.warn(`⚠️ Timeout alcanzado para ${serverId}, estado final desconocido`);
  return null;
}

// 🧠 Ruta principal
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get("email");

    console.log("📩 Email recibido desde query params:", rawEmail);

    if (!rawEmail) {
      console.warn("⚠️ Falta el parámetro email");
      return NextResponse.json({ error: "Falta el parámetro email" }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    console.log(`📧 Email normalizado: "${email}"`);

    // 🔹 Obtener todos los registros de la tabla
    const { data: allServers, error: allError } = await supabase.from("user_servers").select("*");

    if (allError) {
      console.error("💥 Error al consultar Supabase:", allError);
      throw allError;
    }

    console.log("🧾 TODOS los registros en user_servers:", JSON.stringify(allServers, null, 2));

    // 🔹 Filtrar por correo
    const filteredServers = allServers.filter(
      (srv) => String(srv.user_id).trim().toLowerCase() === email
    );

    console.log(`🔹 Servidores que coinciden con ${email}:`, JSON.stringify(filteredServers, null, 2));

    if (!filteredServers || filteredServers.length === 0) {
      console.log("⚠️ No hay servidores registrados para este usuario");
      return NextResponse.json({ servers: [] });
    }

    // ⚡ Procesar todos los servidores en paralelo
    const results = await Promise.all(
      filteredServers.map(async (srv) => {
        console.log("🟢 Procesando registro de Supabase:", srv);

        const id = String(srv.hetzner_server_id);
        if (!id || id === "null" || id === "undefined") {
          console.warn(`⚠️ ID inválido para registro: ${JSON.stringify(srv)}`);
          return null;
        }

        const result = await waitForServerRunning(id);

        if (!result) {
          console.log(`⚠️ Servidor ${id} no está running tras varios intentos`);
          return { id, valid: false };
        }

        const { server, project } = result;

        return {
          id,
          name: server.name,
          ip: server.public_net?.ipv4?.ip || "No asignada",
          status: server.status,
          project,
          type: srv.server_type || "Desconocido",
          gpu: srv.gpu_type || "N/A",
          valid: true,
        };
      })
    );

    // 🧹 Clasificar válidos y no válidos
    const validServers = results.filter((r) => r && r.valid);
    const removedServers = results
      .filter((r) => r && !r.valid)
      .map((r) => r.id);

    console.log(`📊 Total servidores válidos: ${validServers.length}`);
    if (removedServers.length > 0) {
      console.log(`🟠 Servidores no válidos: ${removedServers.join(", ")}`);
    }

    return NextResponse.json({
      servers: validServers,
      removed: removedServers,
      total: filteredServers.length,
    });
  } catch (err) {
    console.error("💥 Error general en get-user-servers:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
