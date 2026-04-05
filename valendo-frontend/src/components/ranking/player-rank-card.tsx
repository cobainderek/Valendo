"use client";

import { Zap, Target, Swords, TrendingUp } from "lucide-react";
import { RankBadge } from "./rank-badge";
import type { RankedPlayer } from "@/types";

interface PlayerRankCardProps {
  player: RankedPlayer;
}

export function PlayerRankCard({ player }: PlayerRankCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white card-shadow glow-blue">
      <div className="h-1 w-full bg-gradient-to-r from-brand-blue via-brand-orange to-brand-blue" />
      <div className="flex items-center gap-5 p-6">
        <RankBadge rank={player.rank} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-brand-blue">{player.name}</span>
            <span className="font-mono text-xs text-muted-foreground">{player.tag}</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <div className="flex items-center gap-1.5 text-sm">
              <Zap className="h-4 w-4 text-brand-blue" />
              <span className="font-mono font-bold">{player.points.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">pts</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Swords className="h-4 w-4 text-brand-orange" />
              <span className="font-mono font-bold">{player.wins}</span>
              <span className="text-xs text-muted-foreground">vitorias</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Target className="h-4 w-4 text-brand-green" />
              <span className="font-mono font-bold">{player.accuracy}%</span>
              <span className="text-xs text-muted-foreground">acertos</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <TrendingUp className="h-5 w-5 text-brand-blue/50" />
          <span className="font-mono text-3xl font-black text-brand-blue">#{player.rank}</span>
        </div>
      </div>
    </div>
  );
}
