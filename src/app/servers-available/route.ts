// src/app/api/servers-available/route.ts
export async function GET() {
  const servers = [
    { id: 1, name: "GPU CX32 + RTX 3080" },
    { id: 2, name: "GPU CX42 + RTX 4080" }
  ];

  return new Response(JSON.stringify(servers), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
