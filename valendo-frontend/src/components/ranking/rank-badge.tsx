"use client";

import { Trophy, Medal, Star } from "lucide-react";

interface RankBadgeProps {
  rank: number;
  size?: "sm" | "lg";
}

const CONFIGS = [
  { bg: "bg-yellow-500/15", text: "text-yellow-400", icon: Trophy, glow: "shadow-[0_0_12px_#eab30833]" },
  { bg: "bg-gray-300/10", text: "text-gray-300", icon: Medal, glow: "shadow-[0_0_12px_#9ca3af22]" },
  { bg: "bg-orange-500/10", text: "text-orange-400", icon: Medal, glow: "shadow-[0_0_12px_#f9731622]" },
];

export function RankBadge({ rank, size = "sm" }: RankBadgeProps) {
  if (rank > 3) {
    const s = size === "lg" ? "h-12 w-12 text-lg" : "h-9 w-9 text-sm";
    return (
      <span className={`flex items-center justify-center rounded-xl bg-secondary font-mono font-bold text-muted-foreground ${s}`}>
        {rank}
      </span>
    );
  }

  const cfg = CONFIGS[rank - 1];
  const Icon = cfg.icon;
  const s = size === "lg" ? "h-14 w-14" : "h-9 w-9";
  const iconS = size === "lg" ? "h-7 w-7" : "h-4 w-4";

  return (
    <span className={`flex items-center justify-center rounded-xl ${cfg.bg} ${cfg.glow} ${s}`}>
      <Icon className={`${iconS} ${cfg.text}`} />
    </span>
  );
}
