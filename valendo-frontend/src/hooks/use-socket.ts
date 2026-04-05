"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SocketService, type SocketStatus } from "@/lib/socket";
import { getToken } from "@/lib/auth";

export function useSocket() {
  const socketRef = useRef<SocketService | null>(null);
  const [status, setStatus] = useState<SocketStatus>("disconnected");

  useEffect(() => {
    const socket = new SocketService();
    socketRef.current = socket;

    const unsub = socket.onStatus(setStatus);

    const token = getToken();
    if (token) {
      socket.connect(token);
    }

    return () => {
      unsub();
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, []);

  const send = useCallback((event: string, data?: unknown) => {
    socketRef.current?.send(event, data);
  }, []);

  const on = useCallback((event: string, handler: (data: unknown) => void) => {
    return socketRef.current?.on(event, handler) ?? (() => {});
  }, []);

  return { status, send, on };
}
