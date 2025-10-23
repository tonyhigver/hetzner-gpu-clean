// 📄 src/app/api/create-user-server/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 🌐 Detectar entorno
    const isDev = process.env.NODE_ENV === "development";

    // ✅ URL del backend (en dev usa localhost, en prod tu IP pública)
    const backendUrl = isDev
      ? "http://localhost:4000/api/create-user-server"
      : "http://157.180.118.67:4000/api/create-user-server";

    console.log("🔁 Reenviando petición al backend:", backendUrl);

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
        { error: `Backend error: ${res.status}` },
        { status: res.status }
      );
    }

    // ✅ Todo OK → reenviamos el JSON al frontend
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("🔥 Error en proxy Next.js:", err);
    return NextResponse.json(
      { error: "Error conectando con el backend" },
      { status: 500 }
    );
  }
}