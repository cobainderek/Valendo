"use client";

import { Users, Swords, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Room } from "@/types";

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
  loading?: boolean;
}

export function RoomCard({ room, onJoin, loading }: RoomCardProps) {
  const isFull = room.players.length >= room.maxPlayers;
  const fillPercent = (room.players.length / room.maxPlayers) * 100;

  return (
    <div className="group rounded-xl bg-white card-shadow transition-all duration-300 hover:card-shadow-lg">
      <div className="flex items-center gap-4 p-4">
        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 transition-all group-hover:bg-brand-blue/15">
          <Swords className="h-6 w-6 text-brand-blue" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{room.theme}</span>
            <span className="rounded-md bg-brand-blue/10 px-2 py-0.5 font-mono text-[11px] font-semibold tracking-widest text-brand-blue">
              {room.code}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span className="font-semibold text-foreground">{room.players.length}</span>/{room.maxPlayers}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-brand-blue/40" />
              {room.rounds} rodadas
            </span>
          </div>
          {/* Player bar */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan transition-all"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* Join button */}
        <Button
          disabled={isFull || loading}
          onClick={() => onJoin(room.id)}
          className="h-10 gap-2 rounded-lg bg-brand-blue px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-blue/90 disabled:opacity-30 disabled:shadow-none"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isFull ? (
            "Cheia"
          ) : (
            <>
              Entrar
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
