"use client";

import { SocketProvider } from "@/contexts/socket-context";

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SocketProvider>{children}</SocketProvider>;
}
