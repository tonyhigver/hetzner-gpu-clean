// app/api/get-user-servers/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Debug: verificar que las variables de entorno están disponibles
console.log(
  "🔑 NEXT_PUBLIC_SUPABASE_URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ OK" : "❌ NO EXISTE"
);
console.log(
  "🔑 SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ OK" : "❌ NO EXISTE"
);
console.log(
  "🔑 HETZNER_API_TOKEN_PROJECT1:",
  process.env.HETZNER_API_TOKEN_PROJECT1 ? "✅ OK" : "❌ NO EXISTE"
);
console.log(
  "🔑 HETZNER_API_TOKEN_PROJECT2:",
  process.env.HETZNER_API_TOKEN_PROJECT2 ? "✅ OK" : "❌ NO EXISTE"
);
console.log(
  "🔑 HETZNER_API_TOKEN_PROJECT3:",
  process.env.HETZNER_API_TOKEN_PROJECT3 ? "✅ OK" : "❌ NO EXISTE"
);
console.log(
  "🔑 HETZNER_API_TOKEN_PROJECT4:",
  process.env.HETZNER_API_TOKEN_PROJECT4 ? "✅ OK" : "❌ NO EXISTE"
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mapeo de tokens según proyecto
const hetznerTokens: Record<string, string> = {
  project1: process.env.HETZNER_API_TOKEN_PROJECT1!,
  project2: process.env.HETZNER_API_TOKEN_PROJECT2!,
  project3: process.env.HETZNER_API_TOKEN_PROJECT3!,
  project4: process.env.HETZNER_API_TOKEN_PROJECT4!,
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    console.log("✅ Request recibido para email:", email);

    if (!email) {
      console.error("❌ Falta el parámetro email");
      return NextResponse.json({ error: "Falta el parámetro email" }, { status: 400 });
    }

    const { data: userServers, error } = await supabase
      .from("user_servers")
      .select("*")
      .eq("user_id", email);

    console.log("📊 Datos de Supabase:", userServers, "Error:", error);

    if (error) {
      console.error("💥 Error al consultar Supabase:", error);
      throw error;
    }

    if (!userServers || userServers.length === 0) {
      console.warn("⚠️ No se encontraron servidores para este usuario");
      return NextResponse.json({ servers: [] });
    }

    const hetznerServers = await Promise.all(
      userServers.map(async (srv) => {
        try {
          console.log("🌐 Consultando Hetzner para server_id:", srv.hetzner_server_id);

          // Elegir token correcto según el proyecto del server
          const token = hetznerTokens[srv.hetzner_project] || process.env.HETZNER_API_TOKEN_PROJECT1!;

          const res = await fetch(
            `https://api.hetzner.cloud/v1/servers/${srv.hetzner_server_id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!res.ok) {
            console.error("❌ Error al consultar Hetzner:", res.status, await res.text());
            throw new Error("No encontrado en Hetzner");
          }

          const { server } = await res.json();

          return {
            id: srv.hetzner_server_id,
            name: server.name,
            type: srv.server_type || "Desconocido",
            gpu: srv.gpu_type || "N/A",
            ip: server.public_net?.ipv4?.ip || srv.ip || "No asignada",
            status: server.status,
          };
        } catch (err) {
          console.error("⚠️ Error al procesar servidor Hetzner:", err);
          return {
            id: srv.hetzner_server_id,
            name: "Desconocido",
            type: srv.server_type || "Desconocido",
            gpu: srv.gpu_type || "N/A",
            ip: srv.ip || "No asignada",
            status: "desconectado",
          };
        }
      })
    );

    console.log("✅ Servidores listos:", hetznerServers);

    return NextResponse.json({ servers: hetznerServers });
  } catch (err) {
    console.error("💥 Error en get-user-servers:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
