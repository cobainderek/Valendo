"use client";

import { HelpCircle } from "lucide-react";
import type { SocketQuestion } from "@/types";

interface QuestionCardProps {
  question: SocketQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="space-y-4">
      {/* Round indicator */}
      <div className="flex items-center justify-center gap-2">
        <span className="rounded-lg bg-brand-blue/10 px-3 py-1 font-mono text-xs font-bold tracking-wider text-brand-blue">
          RODADA {question.round}/{question.totalRounds}
        </span>
      </div>

      {/* Question */}
      <div className="rounded-2xl bg-white card-shadow p-8">
        <div className="flex gap-4">
          <HelpCircle className="mt-0.5 h-7 w-7 shrink-0 text-brand-blue" />
          <p className="text-xl font-semibold leading-relaxed">{question.text}</p>
        </div>
      </div>
    </div>
  );
}
