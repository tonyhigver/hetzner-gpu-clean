"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store"; // evita prerender y cacheo

import { Suspense } from "react";
import ProcessingInner from "./ProcessingInner";

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white text-xl">
          Cargando parámetros...
        </div>
      }
    >
      <ProcessingInner />
    </Suspense>
  );
}
