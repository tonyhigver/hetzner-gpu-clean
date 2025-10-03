"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/planes"); // Redirige a la página de planes o login
    } else {
      router.push("/planes"); // o dashboard si quieres
    }
  }, [session, router]);

  return <div>Cargando...</div>;
}
