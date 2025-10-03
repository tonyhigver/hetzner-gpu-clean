import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "cx32-rtx3080", title: "CX32 + RTX 3080", cpu: "8 vCPU", ram: "32GB", gpu: "RTX 3080", price: 50 },
    { id: "cx42-rtx4080", title: "CX42 + RTX 4080", cpu: "16 vCPU", ram: "64GB", gpu: "RTX 4080", price: 99 },
  ]);
}
