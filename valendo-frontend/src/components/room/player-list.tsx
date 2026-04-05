"use client";

import { CheckCircle2, Clock, Crown, User } from "lucide-react";
import type { RoomPlayer } from "@/types";

interface PlayerListProps {
  players: RoomPlayer[];
  ownerId: string;
}

export function PlayerList({ players, ownerId }: PlayerListProps) {
  return (
    <div className="space-y-2">
      {players.map((player) => {
        const isHost = player.id === ownerId;
        return (
          <div
            key={player.id}
            className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all ${
              player.isReady
                ? "bg-brand-green/10 border border-brand-green/20"
                : "bg-white card-shadow"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  isHost
                    ? "bg-brand-orange/15 text-brand-orange"
                    : "bg-brand-blue/10 text-brand-blue"
                }`}
              >
                {isHost ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${player.isReady ? "text-white" : "text-foreground"}`}>{player.name}</span>
                  {isHost && (
                    <span className="rounded-md bg-brand-orange/15 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                      Host
                    </span>
                  )}
                </div>
                <span className={`font-mono text-xs ${player.isReady ? "text-white/50" : "text-muted-foreground"}`}>{player.tag}</span>
              </div>
            </div>

            {/* Status */}
            {player.isReady ? (
              <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-green">
                <CheckCircle2 className="h-4 w-4" />
                Pronto
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 animate-pulse" />
                Aguardando
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
