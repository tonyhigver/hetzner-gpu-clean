// src/app/servers-available/page.tsx
'use client';

import { useEffect, useState } from 'react';

interface Server {
  id: number;
  name: string;
}

export default function ServersAvailablePage() {
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    fetch('/api/servers-available')
      .then(res => res.json())
      .then(data => setServers(data))
      .catch(err => console.error('Error al cargar servidores:', err));
  }, []);

  return (
    <div>
      <h1>Servidores disponibles</h1>
      {servers.length === 0 ? (
        <p>Cargando servidores...</p>
      ) : (
        <ul>
          {servers.map(server => (
            <li key={server.id}>{server.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
