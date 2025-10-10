import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    // 🔹 Tu backend real
    const res = await fetch("http://157.180.118.67:4000/api/create-user-server", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("🔥 Error en proxy Next.js:", err);
    return NextResponse.json({ error: "Error conectando con el backend" }, { status: 500 });
  }
}
