// 📁 src/app/api/ssh-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * Endpoint para generar un JWT temporal que autoriza al cliente
 * a conectarse vía WebSocket (WSS) al backend SSH.
 */
export async function POST(req: NextRequest) {
  console.log("🟢 [ssh-token] Nueva solicitud recibida en /api/ssh-token");

  try {
    // 1️⃣ Leer y validar body
    const body = await req.json();
    console.log("📦 [ssh-token] Body recibido:", body);

    const { serverId, email } = body || {};

    if (!serverId) {
      console.warn("⚠️ [ssh-token] FALTA serverId en la petición");
      return NextResponse.json(
        { error: "Falta el parámetro serverId" },
        { status: 400 }
      );
    }

    if (!email) {
      console.warn("⚠️ [ssh-token] FALTA email en la petición");
      return NextResponse.json(
        { error: "Falta el parámetro email" },
        { status: 400 }
      );
    }

    // 2️⃣ Validar variable de entorno
    const secret = process.env.SSH_JWT_SECRET;
    if (!secret) {
      console.error("❌ [ssh-token] No se encontró SSH_JWT_SECRET en el entorno");
      return NextResponse.json(
        { error: "Servidor mal configurado (falta SSH_JWT_SECRET)" },
        { status: 500 }
      );
    }

    // 3️⃣ Construir payload del token
    const payload = {
      serverId,
      email,
      timestamp: new Date().toISOString(),
    };

    console.log("🧩 [ssh-token] Payload del token:", payload);

    // 4️⃣ Generar JWT
    const token = jwt.sign(payload, secret, { expiresIn: "2m" });
    console.log("🔐 [ssh-token] JWT generado correctamente (expira en 2m)");

    // 5️⃣ Devolver respuesta
    const response = {
      ok: true,
      issuedAt: new Date().toISOString(),
      expiresIn: "2m",
      token,
    };

    console.log("📤 [ssh-token] Respuesta final enviada al cliente:", response);

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("💥 [ssh-token] Error interno al procesar la solicitud:", err);
    return NextResponse.json(
      {
        error: "Error interno en el servidor",
        details: err?.message || err,
      },
      { status: 500 }
    );
  }
}
