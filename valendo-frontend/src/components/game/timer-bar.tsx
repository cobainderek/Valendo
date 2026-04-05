"use client";

import { Timer } from "lucide-react";

interface TimerBarProps {
  remaining: number;
  total: number;
}

export function TimerBar({ remaining, total }: TimerBarProps) {
  const percent = (remaining / total) * 100;
  const isUrgent = remaining <= 10;
  const isCritical = remaining <= 5;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className={`h-5 w-5 ${isCritical ? "animate-pulse text-destructive" : isUrgent ? "text-yellow-400" : "text-brand-blue"}`} />
          <span className="text-sm font-medium text-muted-foreground">Tempo</span>
        </div>
        <span
          className={`font-mono text-2xl font-black tabular-nums ${
            isCritical ? "text-destructive" : isUrgent ? "text-yellow-400" : "text-brand-blue"
          }`}
        >
          {remaining}s
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary/70">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isCritical
              ? "bg-gradient-to-r from-destructive to-red-500 shadow-[0_0_12px_#ff334488]"
              : isUrgent
                ? "bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-[0_0_12px_#eab30844]"
                : "bg-gradient-to-r from-brand-blue to-brand-cyan shadow-[0_0_12px_rgba(43,94,167,0.3)]"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
