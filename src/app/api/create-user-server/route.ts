// 📄 src/app/api/create-user-server/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // 🔹 Import correcto de authOptions

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 🌐 Detectar entorno
    const isDev = process.env.NODE_ENV === "development";

    // 🔹 Obtener sesión de NextAuth directamente (App Router)
    const session = await getServerSession(authOptions);

    // ✅ Si no se envía userEmail en body, usar el de la sesión
    if (!body.userEmail) {
      if (session?.user?.email) {
        console.log("ℹ️ Obteniendo userEmail desde sesión:", session.user.email);
        body.userEmail = session.user.email;
      } else if (isDev) {
        console.warn("⚠️ userEmail no recibido, usando valor de prueba en dev");
        body.userEmail = "test@local.dev";
      } else {
        console.error("❌ userEmail no recibido y no hay sesión activa");
        return NextResponse.json(
          { error: "userEmail es obligatorio" },
          { status: 400 }
        );
      }
    }

    // ✅ URL del backend (en dev usa localhost, en prod tu IP pública)
    const backendUrl = isDev
      ? "http://localhost:4000/api/create-user-server"
      : "http://157.180.118.67:4000/api/create-user-server";

    console.log("🔁 Reenviando petición al backend:", backendUrl);
    console.log("📦 Body enviado:", body);

    // 🔹 Reenviar al backend
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // ⚠️ Si el backend devuelve error (como 404 o 500)
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error desde backend:", res.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${res.status}`, details: errorText },
        { status: res.status }
      );
    }

    // ✅ Todo OK → reenviamos el JSON al frontend
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("🔥 Error en proxy Next.js:", err);
    return NextResponse.json(
      { error: "Error conectando con el backend", details: err.message },
      { status: 500 }
    );
  }
}