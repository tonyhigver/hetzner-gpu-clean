"use client";

import CreateServerContent from "./CreateServerContent";

// 👇 Esto evita que Next.js intente prerender la página durante el build
export const dynamic = "force-dynamic";

export default function CreateServerPage() {
  // ✅ Ya no necesitamos Suspense porque toda la página es cliente
  return <CreateServerContent />;
}
