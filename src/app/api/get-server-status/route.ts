export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  console.log("[get-user-servers] Request recibida"); // 🔹 LOG 1

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    console.log("[get-user-servers] Email recibido:", email); // 🔹 LOG 2

    if (!email) {
      console.log("[get-user-servers] Falta email");
      return NextResponse.json({ error: "Falta el parámetro email" }, { status: 400 });
    }

    const { data: userServers, error } = await supabase
      .from("user_servers")
      .select("*")
      .eq("user_id", email);

    console.log("[get-user-servers] userServers:", userServers); // 🔹 LOG 3

    if (error) throw error;

    const hetznerServers = await Promise.all(
      (userServers || []).map(async (srv) => {
        console.log("[get-user-servers] Consultando Hetzner:", srv.hetzner_server_id); // 🔹 LOG 4
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
        } catch (err) {
          console.log("[get-user-servers] Error Hetzner:", err); // 🔹 LOG 5
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

    console.log("[get-user-servers] hetznerServers:", hetznerServers); // 🔹 LOG 6
    return NextResponse.json({ servers: hetznerServers });
  } catch (err) {
    console.error("[get-user-servers] Error interno:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
