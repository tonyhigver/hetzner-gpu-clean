"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serverId = searchParams.get("serverId");

  const [showServers, setShowServers] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowServers(true);

      if (serverId) {
        setTimeout(() => {
          router.push(`/dashboard?serverId=${serverId}`);
        }, 3000);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [serverId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white text-3xl bg-gray-950">
      <div>🚀 Dashboard funcionando correctamente.</div>
      {showServers && (
        <div className="mt-8 text-4xl font-bold text-blue-400">
          SERVIDORES
        </div>
      )}
    </div>
  );
}
