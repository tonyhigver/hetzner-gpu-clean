"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

  // ✅ Redirección si NO está logueado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // ✅ Mientras valida sesión
  if (status === "loading") {
    return <p className="text-white text-center mt-10">Cargando...</p>;
  }

  // ✅ Cargar los planes
  useEffect(() => {
    fetch("/api/servers")
      .then((res) => res.json())
      .then((data) => setPlans(data))
      .catch((err) => console.error("Error al cargar planes:", err));
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-8 px-6">
      <h1 className="text-3xl font-bold text-white mb-6">Servidores Disponibles</h1>

      {plans.length === 0 ? (
        <p className="text-white">Cargando planes...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-gray-800 text-white rounded-lg p-6 shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-2">{plan.title}</h2>
              <p className="text-sm text-gray-300 mb-2">
                {plan.cpu} • {plan.ram} • {plan.gpu}
              </p>
              <p className="text-lg font-bold mb-4">{plan.price} €/mes</p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition">
                Elegir plan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
