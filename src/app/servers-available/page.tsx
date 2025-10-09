import { Suspense } from "react";
import CreateServerContent from "./CreateServerContent";

// 👇 Esto evita que Next.js intente prerender la página durante el build
export const dynamic = "force-dynamic";

export default function CreateServerPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-center mt-10">Cargando...</div>}>
      <CreateServerContent />
    </Suspense>
  );
}
