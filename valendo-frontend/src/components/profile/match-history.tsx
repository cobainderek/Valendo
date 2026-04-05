"use client";

import { Trophy, X, Minus, Target, Swords } from "lucide-react";
import type { MatchHistoryEntry, MatchResult } from "@/types";

interface MatchHistoryProps {
  matches: MatchHistoryEntry[];
}

const RESULT_CONFIG: Record<MatchResult, { label: string; color: string; bg: string; border: string; icon: typeof Trophy }> = {
  win: { label: "Vitoria", color: "text-brand-green", bg: "bg-brand-green/10", border: "border-brand-green/20", icon: Trophy },
  loss: { label: "Derrota", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", icon: X },
  draw: { label: "Empate", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Minus },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "agora";
  if (hours < 24) return `${hours}h atras`;
  const days = Math.floor(hours / 24);
  return `${days}d atras`;
}

export function MatchHistory({ matches }: MatchHistoryProps) {
  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const cfg = RESULT_CONFIG[match.result];
        const Icon = cfg.icon;

        return (
          <div
            key={match.id}
            className={`flex items-center gap-4 rounded-xl bg-white card-shadow border-l-4 px-5 py-4 transition-all ${cfg.border}`}
          >
            {/* Result icon */}
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
              <Icon className={`h-5 w-5 ${cfg.color}`} />
            </div>

            {/* Match info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold">{match.theme}</span>
                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Swords className="h-3 w-3" />
                  vs {match.opponent}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {match.correctAnswers}/{match.totalQuestions}
                </span>
                <span>{timeAgo(match.date)}</span>
              </div>
            </div>

            {/* Points */}
            <div className="text-right">
              <span className="font-mono text-lg font-black">{match.points}</span>
              <p className="text-[10px] text-muted-foreground">pontos</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
