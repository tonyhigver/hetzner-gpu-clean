'use client';
import { useEffect, useState } from 'react';

interface Server {
  id: string;
  title: string;
  cpu: string;
  ram: string;
  gpu: string;
  price: number;
}

export default function ServersAvailablePage() {
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    // Llamada a la API correcta
    fetch('/api/servers')
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
            <li key={server.id}>
              <strong>{server.title}</strong> - {server.cpu}, {server.ram}, {server.gpu} → {server.price}€
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
