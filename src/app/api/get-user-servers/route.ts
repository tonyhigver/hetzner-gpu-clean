// app/api/get-user-servers/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    if (error) throw error;
    if (!userServers || userServers.length === 0) {
      console.warn("⚠️ No se encontraron servidores para este usuario");
      return NextResponse.json({ servers: [] });
    }

    const hetznerServers = await Promise.all(
      userServers.map(async (srv) => {
        try {
          console.log("🌐 Consultando Hetzner para server_id:", srv.hetzner_server_id);

          const res = await fetch(
            `https://api.hetzner.cloud/v1/servers/${srv.hetzner_server_id}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_HETZNER_API_TOKEN_PROJECT1}`,
              },
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
