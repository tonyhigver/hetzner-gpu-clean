import { Suspense } from "react";
import CreateServerContent from "./CreateServerContent";

export const dynamic = "force-dynamic"; // 👈 evita prerender durante el build

export default function CreateServerPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-center mt-10">Cargando...</div>}>
      <CreateServerContent />
    </Suspense>
  );
}
