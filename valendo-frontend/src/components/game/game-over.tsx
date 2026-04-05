"use client";

import { Trophy, Medal, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlayerFinalResult } from "@/types";

interface GameOverProps {
  players: PlayerFinalResult[];
  currentUserId: string;
  onBackToDashboard: () => void;
}

const RANK_CONFIG = [
  { bg: "bg-yellow-500/15", border: "border-yellow-500/30", text: "text-yellow-400", icon: Trophy, label: "1o Lugar" },
  { bg: "bg-gray-400/10", border: "border-gray-400/20", text: "text-gray-300", icon: Medal, label: "2o Lugar" },
  { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", icon: Medal, label: "3o Lugar" },
];

export function GameOver({ players, currentUserId, onBackToDashboard }: GameOverProps) {
  const winner = players[0];
  const isWinner = winner?.playerId === currentUserId;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-10">
      {/* Winner announce */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className={`flex h-24 w-24 items-center justify-center rounded-3xl ${isWinner ? "bg-yellow-500/15 card-shadow-lg" : "bg-secondary/50"}`}>
          <Trophy className={`h-12 w-12 ${isWinner ? "text-yellow-400" : "text-muted-foreground"}`} />
        </div>
        <div>
          <h1 className="text-4xl font-black">
            {isWinner ? (
              <span className="text-brand-blue">Vitoria!</span>
            ) : (
              "Fim de Jogo"
            )}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isWinner ? "Voce venceu o duelo!" : `${winner?.name} venceu o duelo`}
          </p>
        </div>
      </div>

      {/* Rankings */}
      <div className="w-full max-w-lg space-y-3">
        {players.map((player, i) => {
          const cfg = RANK_CONFIG[i] ?? {
            bg: "bg-secondary/30",
            border: "border-border/20",
            text: "text-muted-foreground",
            icon: Star,
            label: `${i + 1}o Lugar`,
          };
          const Icon = cfg.icon;
          const isMe = player.playerId === currentUserId;

          return (
            <div
              key={player.playerId}
              className={`flex items-center gap-4 rounded-2xl border-2 px-6 py-5 transition-all ${cfg.border} ${cfg.bg} ${
                isMe ? "glow-blue" : ""
              }`}
            >
              {/* Rank icon */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cfg.bg}`}>
                <Icon className={`h-7 w-7 ${cfg.text}`} />
              </div>

              {/* Player info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {player.name}
                    {isMe && <span className="ml-1 text-xs text-brand-blue">(voce)</span>}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{player.tag}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{player.correctAnswers} acertos</span>
                  <span className={`font-medium ${cfg.text}`}>{cfg.label}</span>
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <span className={`font-mono text-3xl font-black ${i === 0 ? "text-brand-blue" : cfg.text}`}>
                  {player.totalPoints}
                </span>
                <p className="text-[10px] text-muted-foreground">pontos</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <Button
        onClick={onBackToDashboard}
        className="h-14 gap-2.5 rounded-xl bg-brand-blue px-8 text-base font-bold text-white shadow-md transition-all hover:shadow-lg hover:bg-brand-blue/90"
      >
        Voltar ao Dashboard
        <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
