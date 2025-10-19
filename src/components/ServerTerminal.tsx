"use client";
import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

export default function ServerTerminal({ serverId }: { serverId: string }) {
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!serverId) return;

    const term = new Terminal({ cursorBlink: true });
    term.open(termRef.current!);

    term.writeln("🟢 Inicializando terminal...");
    console.log("[ServerTerminal] Iniciando terminal para serverId:", serverId);

    const connect = async () => {
      try {
        term.writeln("🔄 Obteniendo token JWT del endpoint /api/ssh-token...");
        console.log("[ServerTerminal] Solicitando token JWT...");

        const res = await fetch("/api/ssh-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serverId }),
        });

        if (!res.ok) {
          term.writeln(`❌ Error HTTP al pedir token: ${res.status}`);
          console.error("[ServerTerminal] Error HTTP:", res.status, res.statusText);
          return;
        }

        const json = await res.json();
        console.log("[ServerTerminal] Respuesta del endpoint:", json);

        const { token } = json;
        if (!token) {
          term.writeln("❌ No se recibió token JWT válido.");
          console.error("[ServerTerminal] Token ausente o inválido.");
          return;
        }

        const wsUrl = `wss://terminal.allyrogue.site:8080/?token=${token}`;
        term.writeln(`🌐 Conectando al WebSocket:\n${wsUrl}`);
        console.log("[ServerTerminal] Conectando al WS con token:", wsUrl);

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          term.writeln("✅ Conectado al servidor WebSocket.");
          console.log("[ServerTerminal] WS conectado correctamente.");
        };

        ws.onmessage = (msg) => {
          try {
            const { type, data } = JSON.parse(msg.data);
            if (type === "output") {
              term.write(data);
            } else {
              console.log("[ServerTerminal] Mensaje WS recibido (sin output):", msg.data);
            }
          } catch (err) {
            console.warn("[ServerTerminal] Mensaje no JSON:", msg.data);
            term.write(msg.data);
          }
        };

        ws.onerror = (err) => {
          term.writeln("\n❌ Error en conexión WebSocket.");
          console.error("[ServerTerminal] WS error:", err);
        };

        ws.onclose = (e) => {
          term.writeln(`\n🔴 Conexión cerrada (código: ${e.code}, motivo: ${e.reason || "sin motivo"})`);
          console.log("[ServerTerminal] WS cerrado:", e);
        };

        // Reenvía lo que el usuario escriba al WebSocket
        term.onData((data) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "input", data }));
          } else {
            term.writeln("\n⚠️ WebSocket no disponible para enviar datos.");
          }
        });
      } catch (err) {
        term.writeln("💥 Error crítico en la conexión o fetch.");
        console.error("[ServerTerminal] Error fatal:", err);
      }
    };

    connect();
  }, [serverId]);

  return (
    <div
      ref={termRef}
      className="w-full h-[500px] bg-black text-white rounded-lg overflow-hidden"
    />
  );
}
