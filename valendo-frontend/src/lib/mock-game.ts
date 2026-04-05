import type { SocketQuestion, SocketRoundResult, PlayerRoundResult, SocketGameEnd, PlayerFinalResult, GeneratedQuestion } from "@/types";
import { generateQuestions, clearQuestionCache } from "./gemini";

export interface MockGameState {
  questions: GeneratedQuestion[];
  currentRound: number;
  totalRounds: number;
  scores: Map<string, number>;
  correctCounts: Map<string, number>;
  theme: string;
}

export async function createMockGame(totalRounds: number, theme: string = "Geral"): Promise<MockGameState> {
  clearQuestionCache();
  const questions = await generateQuestions({
    theme,
    difficulty: "medium",
    count: totalRounds,
  });

  return {
    questions,
    currentRound: 0,
    totalRounds: questions.length,
    scores: new Map(),
    correctCounts: new Map(),
    theme,
  };
}

export function getMockQuestion(game: MockGameState): SocketQuestion {
  const q = game.questions[game.currentRound];
  return {
    questionId: `q-${game.currentRound}`,
    text: q.text,
    options: q.options,
    round: game.currentRound + 1,
    totalRounds: game.totalRounds,
    timeLimit: 30,
  };
}

export function processMockAnswer(
  game: MockGameState,
  playerId: string,
  _playerName: string,
  optionId: string,
  timeRemaining: number
): { correct: boolean; points: number } {
  const q = game.questions[game.currentRound];
  const correct = optionId === q.correctId;
  const points = correct ? 100 + timeRemaining * 10 : 0;

  game.scores.set(playerId, (game.scores.get(playerId) || 0) + points);
  if (correct) {
    game.correctCounts.set(playerId, (game.correctCounts.get(playerId) || 0) + 1);
  }

  return { correct, points };
}

export function getMockRoundResult(
  game: MockGameState,
  playerAnswer: { playerId: string; name: string; optionId: string; correct: boolean; points: number }
): SocketRoundResult {
  const q = game.questions[game.currentRound];
  const botCorrect = Math.random() > 0.4;
  const botOptionId = botCorrect ? q.correctId : q.options.find((o) => o.id !== q.correctId)!.id;
  const botPoints = botCorrect ? 100 + Math.floor(Math.random() * 200) : 0;

  game.scores.set("bot-1", (game.scores.get("bot-1") || 0) + botPoints);
  if (botCorrect) {
    game.correctCounts.set("bot-1", (game.correctCounts.get("bot-1") || 0) + 1);
  }

  const players: PlayerRoundResult[] = [
    {
      playerId: playerAnswer.playerId,
      name: playerAnswer.name,
      correct: playerAnswer.correct,
      optionId: playerAnswer.optionId,
      points: playerAnswer.points,
      totalPoints: game.scores.get(playerAnswer.playerId) || 0,
    },
    {
      playerId: "bot-1",
      name: "CyberBot",
      correct: botCorrect,
      optionId: botOptionId,
      points: botPoints,
      totalPoints: game.scores.get("bot-1") || 0,
    },
  ];

  return {
    questionId: `q-${game.currentRound}`,
    correctOptionId: q.correctId,
    players: players.sort((a, b) => b.totalPoints - a.totalPoints),
  };
}

export function getMockGameEnd(game: MockGameState, playerId: string, playerName: string, playerTag: string): SocketGameEnd {
  const players: PlayerFinalResult[] = [
    {
      playerId,
      name: playerName,
      tag: playerTag,
      totalPoints: game.scores.get(playerId) || 0,
      correctAnswers: game.correctCounts.get(playerId) || 0,
      rank: 1,
    },
    {
      playerId: "bot-1",
      name: "CyberBot",
      tag: "#0042",
      totalPoints: game.scores.get("bot-1") || 0,
      correctAnswers: game.correctCounts.get("bot-1") || 0,
      rank: 2,
    },
  ];

  players.sort((a, b) => b.totalPoints - a.totalPoints);
  players.forEach((p, i) => (p.rank = i + 1));

  return { players };
}
