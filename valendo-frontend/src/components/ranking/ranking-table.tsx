"use client";

import { Target, Swords, Zap } from "lucide-react";
import { RankBadge } from "./rank-badge";
import type { RankedPlayer } from "@/types";

interface RankingTableProps {
  players: RankedPlayer[];
  currentUserId: string;
}

export function RankingTable({ players, currentUserId }: RankingTableProps) {
  return (
    <div className="space-y-3">
      {players.map((player) => {
        const isMe = player.playerId === currentUserId;
        const isTop3 = player.rank <= 3;

        return (
          <div
            key={player.playerId}
            className={`group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all ${
              isMe
                ? "bg-white card-shadow-lg border-2 border-brand-blue/30 glow-blue"
                : "bg-white card-shadow"
            }`}
          >
            {/* Rank */}
            <RankBadge rank={player.rank} />

            {/* Player info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`truncate font-bold ${isMe ? "text-brand-blue" : ""}`}>
                  {player.name}
                  {isMe && <span className="ml-1.5 text-xs font-normal text-brand-blue/70">(voce)</span>}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{player.tag}</span>
              </div>
              <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Swords className="h-3 w-3" />
                  {player.wins}/{player.matches} vitorias
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {player.accuracy}% acertos
                </span>
              </div>
            </div>

            {/* Points */}
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <Zap className={`h-4 w-4 ${isTop3 ? "text-brand-blue" : "text-muted-foreground"}`} />
                <span className={`font-mono text-xl font-black ${isTop3 ? "text-brand-blue" : "text-foreground"}`}>
                  {player.points.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">pontos</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
