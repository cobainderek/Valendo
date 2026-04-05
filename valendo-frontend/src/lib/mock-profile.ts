import type { PlayerProfile } from "@/types";

const delay = () => new Promise((r) => setTimeout(r, 400));

export async function mockGetProfile(): Promise<PlayerProfile> {
  await delay();
  return {
    id: "mock-user-1",
    name: "Jogador",
    email: "admin@valendo.com",
    tag: "#0001",
    avatar: "🎮",
    created_at: "2025-12-01T10:00:00Z",
    stats: {
      totalMatches: 47,
      wins: 28,
      losses: 19,
      winRate: 60,
      totalCorrect: 189,
      totalQuestions: 235,
      accuracy: 80,
      bestStreak: 12,
      totalPoints: 14200,
    },
    recentMatches: [
      {
        id: "m1",
        theme: "Tecnologia",
        result: "win",
        points: 850,
        correctAnswers: 4,
        totalQuestions: 5,
        opponent: "CyberBot",
        date: "2026-03-14T18:30:00Z",
      },
      {
        id: "m2",
        theme: "Historia",
        result: "loss",
        points: 320,
        correctAnswers: 2,
        totalQuestions: 5,
        opponent: "NeonSlayer",
        date: "2026-03-14T16:00:00Z",
      },
      {
        id: "m3",
        theme: "Ciencia",
        result: "win",
        points: 720,
        correctAnswers: 3,
        totalQuestions: 5,
        opponent: "PixelStorm",
        date: "2026-03-13T21:15:00Z",
      },
      {
        id: "m4",
        theme: "Geografia",
        result: "win",
        points: 940,
        correctAnswers: 5,
        totalQuestions: 5,
        opponent: "GlitchQueen",
        date: "2026-03-13T19:00:00Z",
      },
      {
        id: "m5",
        theme: "Esportes",
        result: "loss",
        points: 200,
        correctAnswers: 1,
        totalQuestions: 5,
        opponent: "ByteRunner",
        date: "2026-03-12T22:30:00Z",
      },
      {
        id: "m6",
        theme: "Cultura Pop",
        result: "win",
        points: 680,
        correctAnswers: 4,
        totalQuestions: 5,
        opponent: "HexMaster",
        date: "2026-03-12T20:00:00Z",
      },
    ],
  };
}

export async function mockUpdateProfile(data: { name: string; avatar: string }): Promise<void> {
  await delay();
  // In a real app this would call the API
  void data;
}

export const AVATARS = ["🎮", "⚡", "🔥", "💀", "🤖", "👾", "🦾", "🧠", "🎯", "🏆", "💎", "🌀"];
