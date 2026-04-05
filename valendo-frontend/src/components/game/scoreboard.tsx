"use client";

import { Trophy, Check, X } from "lucide-react";
import type { PlayerRoundResult } from "@/types";

interface ScoreboardProps {
  players: PlayerRoundResult[];
  title?: string;
}

export function Scoreboard({ players, title = "Resultado da Rodada" }: ScoreboardProps) {
  return (
    <div className="rounded-2xl bg-white card-shadow p-6">
      <h3 className="mb-5 flex items-center gap-2 text-lg font-bold">
        <Trophy className="h-6 w-6 text-brand-blue" />
        {title}
      </h3>
      <div className="space-y-3">
        {players.map((player, i) => (
          <div
            key={player.playerId}
            className={`flex items-center gap-4 rounded-xl border px-5 py-4 ${
              i === 0
                ? "border-brand-blue/30 bg-brand-blue/5"
                : "border-border/30 bg-background/40"
            }`}
          >
            {/* Rank */}
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-lg font-mono text-lg font-black ${
                i === 0 ? "bg-brand-blue/15 text-brand-blue" : "bg-secondary text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>

            {/* Name */}
            <div className="flex-1">
              <span className="font-semibold">{player.name}</span>
              <div className="flex items-center gap-1 text-xs">
                {player.correct ? (
                  <span className="flex items-center gap-1 text-brand-green">
                    <Check className="h-3 w-3" /> Acertou +{player.points}pts
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-destructive">
                    <X className="h-3 w-3" /> Errou
                  </span>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="text-right">
              <span className="font-mono text-xl font-black text-brand-blue">{player.totalPoints}</span>
              <p className="text-[10px] text-muted-foreground">pontos</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
