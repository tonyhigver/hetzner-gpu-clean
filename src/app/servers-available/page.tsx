"use client";

import React, { Suspense } from "react";
import CreateServerContent from "./CreateServerContent";

export default function CreateServerPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400 mt-20">Cargando página...</div>}>
      <CreateServerContent />
    </Suspense>
  );
}
