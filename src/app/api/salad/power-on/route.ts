import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("[API/salad/power-on] Recibido payload:", body);

    const res = await fetch("https://api.salad.com/api/public/container-groups", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SALAD_API_KEY}`, // sin NEXT_PUBLIC_
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: body.name,
        image: "ubuntu:22.04",
        resources: {
          gpuClass: body.gpuClass,
          replicas: 1,
        },
        command: ["sleep", "60"],
      }),
    });

    const text = await res.text();
    console.log("[API/salad/power-on] Respuesta SaladCloud:", text);

    if (!res.ok) {
      return NextResponse.json({ error: text }, { status: res.status });
    }

    return NextResponse.json({ success: true, data: text });
  } catch (err: any) {
    console.error("[API/salad/power-on] Error general:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}