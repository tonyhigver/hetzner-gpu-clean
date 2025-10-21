import { NextResponse } from "next/server";

/**
 * 🔥 POST /api/salad/power-on
 * Encapsula la llamada a SaladCloud desde el backend (para evitar CORS)
 */
export async function POST(req: Request) {
  console.log("[API /salad/power-on] ▶️ Recibida solicitud POST");

  try {
    const body = await req.json();
    console.log("[API /salad/power-on] Body recibido:", body);

    const apiKey = process.env.SALAD_API_KEY;
    if (!apiKey) {
      console.error("[API /salad/power-on] ❌ Falta SALAD_API_KEY en .env.local");
      return NextResponse.json(
        { error: "Falta SALAD_API_KEY en configuración del servidor" },
        { status: 500 }
      );
    }

    // Payload que se enviará a SaladCloud
    const payload = {
      name: body.name || `gpu-${Date.now()}`,
      container: {
        image: "ubuntu:22.04",
        command: ["bash", "-c", "sleep 60"],
        resources: {
          gpus: 1,
          gpuClasses: [body.gpuClass],
          priority: "batch",
        },
      },
    };

    console.log("[API /salad/power-on] Payload final enviado a SaladCloud:", payload);

    // Llamada a SaladCloud
    const response = await fetch("https://api.salad.com/api/public/container-groups", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("[API /salad/power-on] Respuesta SaladCloud:", response.status, response.statusText);

    const text = await response.text();
    console.log("[API /salad/power-on] Cuerpo respuesta SaladCloud:", text);

    if (!response.ok) {
      console.error("[API /salad/power-on] ❌ Error al crear contenedor:", text);
      return NextResponse.json({ error: text }, { status: response.status });
    }

    return NextResponse.json({ success: true, data: JSON.parse(text) });
  } catch (err: any) {
    console.error("[API /salad/power-on] ❌ Excepción:", err);
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 });
  }
}
