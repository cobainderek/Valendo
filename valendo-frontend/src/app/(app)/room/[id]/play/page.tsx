"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Countdown } from "@/components/game/countdown";
import { QuestionCard } from "@/components/game/question-card";
import { AnswerOption } from "@/components/game/answer-option";
import { TimerBar } from "@/components/game/timer-bar";
import { Scoreboard } from "@/components/game/scoreboard";
import { GameOver } from "@/components/game/game-over";
import {
  createMockGame,
  getMockQuestion,
  processMockAnswer,
  getMockRoundResult,
  getMockGameEnd,
  type MockGameState,
} from "@/lib/mock-game";
import type { SocketQuestion, SocketRoundResult, SocketGameEnd } from "@/types";
import { Loader2 } from "lucide-react";

type GamePhase = "loading" | "countdown" | "question" | "result" | "gameover";

const TIME_LIMIT = 30;
const LABELS = ["A", "B", "C", "D"];

export default function GamePlayPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "Geral";
  const rounds = Number(searchParams.get("rounds")) || 5;
  const { user } = useAuth();
  const router = useRouter();

  const gameRef = useRef<MockGameState | null>(null);
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [question, setQuestion] = useState<SocketQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
  const [roundResult, setRoundResult] = useState<SocketRoundResult | null>(null);
  const [gameEnd, setGameEnd] = useState<SocketGameEnd | null>(null);

  // Init game (async — loads questions from Gemini or fallback)
  useEffect(() => {
    let cancelled = false;
    createMockGame(rounds, theme).then((game) => {
      if (cancelled) return;
      gameRef.current = game;
      setPhase("countdown");
    });
    return () => { cancelled = true; };
  }, [rounds, theme]);

  // Timer
  useEffect(() => {
    if (phase !== "question") return;
    if (timeRemaining <= 0) {
      handleTimeUp();
      return;
    }
    const timer = setTimeout(() => setTimeRemaining((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeRemaining]);

  function handleTimeUp() {
    if (!gameRef.current || !user) return;
    const answer = selectedOption || "";
    const result = processMockAnswer(gameRef.current, user.id, user.name, answer, 0);
    const rr = getMockRoundResult(gameRef.current, {
      playerId: user.id,
      name: user.name,
      optionId: answer,
      correct: result.correct,
      points: result.points,
    });
    setRoundResult(rr);
    setPhase("result");
  }

  const startRound = useCallback(() => {
    if (!gameRef.current) return;
    const q = getMockQuestion(gameRef.current);
    setQuestion(q);
    setSelectedOption(null);
    setTimeRemaining(TIME_LIMIT);
    setRoundResult(null);
    setPhase("question");
  }, []);

  function handleSelectOption(optionId: string) {
    if (selectedOption || phase !== "question" || !gameRef.current || !user) return;
    setSelectedOption(optionId);

    const result = processMockAnswer(gameRef.current, user.id, user.name, optionId, timeRemaining);
    const rr = getMockRoundResult(gameRef.current, {
      playerId: user.id,
      name: user.name,
      optionId,
      correct: result.correct,
      points: result.points,
    });

    setTimeout(() => {
      setRoundResult(rr);
      setPhase("result");
    }, 1500);
  }

  function handleNextRound() {
    if (!gameRef.current || !user) return;
    gameRef.current.currentRound++;
    if (gameRef.current.currentRound >= gameRef.current.totalRounds) {
      const end = getMockGameEnd(gameRef.current, user.id, user.name, user.tag);
      setGameEnd(end);
      setPhase("gameover");
    } else {
      startRound();
    }
  }

  // ── Loading ──
  if (phase === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-blue" />
        <span className="font-mono text-sm text-white/60">Gerando perguntas sobre {theme}...</span>
      </div>
    );
  }

  // ── Countdown ──
  if (phase === "countdown") {
    return (
      <div className="min-h-[80vh]">
        <Countdown onComplete={startRound} />
      </div>
    );
  }

  // ── Game Over ──
  if (phase === "gameover" && gameEnd) {
    return (
      <div className="min-h-[80vh]">
        <GameOver
          players={gameEnd.players}
          currentUserId={user?.id ?? ""}
          onBackToDashboard={() => router.push("/dashboard")}
        />
      </div>
    );
  }

  // ── Result ──
  if (phase === "result" && roundResult && question) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 py-8">
        <QuestionCard question={question} />

        <div className="grid gap-3 sm:grid-cols-2">
          {question.options.map((opt, i) => (
            <AnswerOption
              key={opt.id}
              id={opt.id}
              text={opt.text}
              label={LABELS[i]}
              selected={selectedOption === opt.id}
              correct={opt.id === roundResult.correctOptionId}
              revealed
              disabled
              onSelect={() => {}}
            />
          ))}
        </div>

        <Scoreboard players={roundResult.players} />

        <div className="flex justify-center">
          <button
            onClick={handleNextRound}
            className="bg-brand-blue px-8 py-4 text-base font-bold text-white rounded-xl shadow-md hover:shadow-lg hover:bg-brand-blue/90"
          >
            {gameRef.current && gameRef.current.currentRound + 1 >= gameRef.current.totalRounds
              ? "Ver Resultado Final"
              : "Proxima Pergunta"}
          </button>
        </div>
      </div>
    );
  }

  // ── Question ──
  if (phase === "question" && question) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 py-8">
        <TimerBar remaining={timeRemaining} total={TIME_LIMIT} />
        <QuestionCard question={question} />
        <div className="grid gap-3 sm:grid-cols-2">
          {question.options.map((opt, i) => (
            <AnswerOption
              key={opt.id}
              id={opt.id}
              text={opt.text}
              label={LABELS[i]}
              selected={selectedOption === opt.id}
              correct={null}
              revealed={false}
              disabled={!!selectedOption}
              onSelect={handleSelectOption}
            />
          ))}
        </div>
        {selectedOption && (
          <p className="text-center font-mono text-sm text-white/60 animate-pulse">
            Aguardando resultado...
          </p>
        )}
      </div>
    );
  }

  return null;
}
