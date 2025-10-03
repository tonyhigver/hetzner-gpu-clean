"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";

export default function PlanesPage() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch("/api/servers-available")
      .then(res => res.json())
      .then(data => setPlans(data));
  }, []);

  return (
    <>
      <Header />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan: any) => (
          <div key={plan.id} className="bg-white shadow rounded p-4">
            <h2 className="font-bold text-xl">{plan.title}</h2>
            <p>{plan.cpu} | {plan.ram} | {plan.gpu}</p>
            <p className="font-bold mt-2">{plan.price} €/mes</p>
            <button className="mt-3 bg-green-500 text-white px-4 py-2 rounded">
              Elegir plan
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
