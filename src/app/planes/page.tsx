"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface Server {
  id: string;
  title: string;
  cpu: string;
  ram: string;
  gpu: string;
  price: number;
}

export default function PlanesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Server[]>([]);

  // ✅ Si no está logueado, lo mandamos a la página principal
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // ✅ Mientras verifica sesión
  if (status === "loading") {
    return <p>Cargando...</p>;
  }

  return (
    <>
      <Header />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.length === 0 ? (
          <p>Cargando planes...</p>
        ) : (
          plans.map(plan => (
            <div key={plan.id} className="bg-white shadow rounded p-4">
              <h2 className="font-bold text-xl">{plan.title}</h2>
              <p>{plan.cpu} | {plan.ram} | {plan.gpu}</p>
              <p className="font-bold mt-2">{plan.price} €/mes</p>
              <button className="mt-3 bg-green-500 text-white px-4 py-2 rounded">
                Elegir plan
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
