// src/app/servers-available/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ServersAvailablePage() {
  const [servers, setServers] = useState<any[]>([]);

  useEffect(() => {
    // Llamamos a tu API en src/app/api/servers-available/route.ts
    fetch('/api/servers-available')
      .then((res) => res.json())
      .then((data) => setServers(data))
      .catch((err) => console.error('Error al cargar servidores:', err));
  }, []);

  return (
    <div>
      <h1>Servidores disponibles</h1>
      <pre>{JSON.stringify(servers, null, 2)}</pre>
    </div>
  );
}
