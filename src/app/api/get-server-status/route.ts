import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serverId = searchParams.get("serverId");

  if (!serverId) {
    return NextResponse.json(
      { error: "Falta el parámetro serverId" },
      { status: 400 }
    );
  }

  try {
    // 🔹 Reenvía la petición al backend real
    const res = await fetch(`http://157.180.118.67:4000/api/get-server-status?serverId=${serverId}`);

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("🔥 Error en proxy get-server-status:", err);
    return NextResponse.json(
      { error: "Error conectando con el backend" },
      { status: 500 }
    );
  }
}
