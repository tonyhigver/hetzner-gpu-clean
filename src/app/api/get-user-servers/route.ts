// app/api/get-user-servers/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --- 🔍 Verificar variables de entorno ---
console.log("🔑 NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ OK" : "❌ NO EXISTE");
console.log("🔑 SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ OK" : "❌ NO EXISTE");
console.log("🔑 HETZNER_API_TOKEN_PROJECT1:", process.env.HETZNER_API_TOKEN_PROJECT1 ? "✅ OK" : "❌ NO EXISTE");
console.log("🔑 HETZNER_API_TOKEN_PROJECT2:", process.env.HETZNER_API_TOKEN_PROJECT2 ? "✅ OK" : "❌ NO EXISTE");
console.log("🔑 HETZNER_API_TOKEN_PROJECT3:", process.env.HETZNER_API_TOKEN_PROJECT3 ? "✅ OK" : "❌ NO EXISTE");
console.log("🔑 HETZNER_API_TOKEN_PROJECT4:", process.env.HETZNER_API_TOKEN_PROJECT4 ? "✅ OK" : "❌ NO EXISTE");

// --- Inicializar Supabase ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Lista de tokens disponibles ---
const hetznerTokens = [
  process.env.HETZNER_API_TOKEN_PROJECT1,
  process.env.HETZNER_API_TOKEN_PROJECT2,
  process.env.HETZNER_API_TOKEN_PROJECT3,
  process.env.HETZNER_API_TOKEN_PROJECT4,
].filter(Boolean);

// --- Función auxiliar para probar todos los tokens ---
async function fetchHetznerServer(serverId: string) {
  for (const [index, token] of hetznerTokens.entries()) {
    try {
      const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const { server } = await res.json();
        console.log(`✅ Servidor ${serverId} encontrado con TOKEN PROJECT${index + 1}`);
        return { server, tokenUsed: `PROJECT${index + 1}` };
      }

      if (res.status === 404) {
        console.warn(`⚠️ Servidor ${serverId} no encontrado con PROJECT${index + 1}`);
        continue;
      }

      if (res.status === 401) {
        console.warn(`🚫 Token inválido (401) para PROJECT${index + 1}`);
        continue;
      }

      // Otros errores
      console.error(`❌ Error inesperado (${res.status}) con PROJECT${index + 1}:`, await res.text());
    } catch (err) {
      console.error(`💥 Error al probar PROJECT${index + 1}:`, err);
    }
  }

  // Ningún token funcionó
  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    console.log("✅ Request recibido para email:", email);

    if (!email) {
      return NextResponse.json({ error: "Falta el parámetro email" }, { status: 400 });
    }

    const { data: userServers, error } = await supabase
      .from("user_servers")
      .select("*")
      .eq("user_id", email);

    if (error) throw error;

    if (!userServers || userServers.length === 0) {
      console.warn("⚠️ No se encontraron servidores para este usuario");
      return NextResponse.json({ servers: [] });
    }

    const validServers = [];

    for (const srv of userServers) {
      try {
        console.log(`🌐 Consultando Hetzner para server_id: ${srv.hetzner_server_id}`);

        const result = await fetchHetznerServer(srv.hetzner_server_id);

        if (!result) {
          console.warn(`🧹 Eliminando de Supabase: servidor ${srv.hetzner_server_id} no existe en Hetzner`);
          await supabase.from("user_servers").delete().eq("hetzner_server_id", srv.hetzner_server_id);
          continue;
        }

        const { server, tokenUsed } = result;

        validServers.push({
          id: srv.hetzner_server_id,
          name: server.name,
          type: srv.server_type || "Desconocido",
          gpu: srv.gpu_type || "N/A",
          ip: server.public_net?.ipv4?.ip || srv.ip || "No asignada",
          status: server.status,
          projectToken: tokenUsed,
        });
      } catch (err) {
        console.error("⚠️ Error al procesar servidor Hetzner:", err);
      }
    }

    console.log("✅ Servidores válidos:", validServers.length);
    return NextResponse.json({ servers: validServers });
  } catch (err) {
    console.error("💥 Error en get-user-servers:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
