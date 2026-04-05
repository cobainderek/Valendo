"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { SocketService, type SocketStatus } from "@/lib/socket";
import { getToken } from "@/lib/auth";

interface SocketContextType {
  status: SocketStatus;
  send: (event: string, data?: unknown) => void;
  on: (event: string, handler: (data: unknown) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
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

  return (
    <SocketContext.Provider value={{ status, send, on }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
}
