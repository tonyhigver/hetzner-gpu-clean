export const dynamic = "force-dynamic"; // ⚡ Siempre dinámico

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente Supabase con Service Role Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Falta el parámetro email" }, { status: 400 });
    }

    // 🔹 Obtener servidores asociados al email
    const { data: userServers, error } = await supabase
      .from("user_servers")
      .select("*")
      .eq("user_id", email);

    if (error) throw error;

    // 🔹 Consultar Hetzner para cada servidor
    const hetznerServers = await Promise.all(
      (userServers || []).map(async (srv) => {
        try {
          const res = await fetch(
            `https://api.hetzner.cloud/v1/servers/${srv.hetzner_server_id}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_HETZNER_API_TOKEN_PROJECT1}`,
              },
            }
          );

          if (!res.ok) throw new Error("No encontrado en Hetzner");
          const { server } = await res.json();

          return {
            id: srv.hetzner_server_id,
            name: server.name,
            type: srv.server_type || "Desconocido",
            gpu: srv.gpu_type || "N/A",
            ip: server.ip || server.public_net?.ipv4?.ip || "No asignada",
            status: server.status,
          };
        } catch {
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

    return NextResponse.json({ servers: hetznerServers });
  } catch (err) {
    console.error("Error en get-user-servers:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
