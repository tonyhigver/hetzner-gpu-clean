"use client";
import { useEffect, useState } from "react";
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
  const [plans, setPlans] = useState<Server[]>([]);

  useEffect(() => {
    // Llamada a la API correcta
    fetch("/api/servers")
      .then(res => res.json())
      .then(data => setPlans(data))
      .catch(err => console.error("Error al cargar planes:", err));
  }, []);

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
