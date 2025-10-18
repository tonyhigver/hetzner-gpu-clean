"use client";
import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

export default function ServerTerminal({ serverId }: { serverId: string }) {
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = new Terminal({ cursorBlink: true });
    term.open(termRef.current!);

    const connect = async () => {
      const res = await fetch("/api/ssh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId }),
      });

      const { token } = await res.json();
      if (!token) return term.write("❌ Error al obtener token SSH\n");

      const ws = new WebSocket(`wss://terminal.allyrogue.site/?token=${token}`);

      ws.onmessage = (msg) => {
        const { type, data } = JSON.parse(msg.data);
        if (type === "output") term.write(data);
      };

      term.onData((data) =>
        ws.send(JSON.stringify({ type: "input", data }))
      );
    };

    connect();
  }, [serverId]);

  return (
    <div
      ref={termRef}
      className="w-full h-[500px] bg-black text-white rounded-lg"
    />
  );
}
