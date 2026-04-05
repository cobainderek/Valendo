import type { RankedPlayer, RankingPeriod } from "@/types";

const BASE_PLAYERS: Omit<RankedPlayer, "rank">[] = [
  { playerId: "p1", name: "NeonSlayer", tag: "#7721", points: 12850, wins: 34, matches: 41, accuracy: 89 },
  { playerId: "p2", name: "CyberWolf", tag: "#0042", points: 11200, wins: 29, matches: 38, accuracy: 84 },
  { playerId: "p3", name: "PixelStorm", tag: "#1337", points: 10750, wins: 27, matches: 35, accuracy: 81 },
  { playerId: "mock-user-1", name: "Jogador", tag: "#0001", points: 9400, wins: 22, matches: 30, accuracy: 78 },
  { playerId: "p5", name: "GlitchQueen", tag: "#9090", points: 8900, wins: 20, matches: 28, accuracy: 76 },
  { playerId: "p6", name: "ByteRunner", tag: "#5500", points: 7650, wins: 18, matches: 27, accuracy: 72 },
  { playerId: "p7", name: "HexMaster", tag: "#3344", points: 6800, wins: 15, matches: 25, accuracy: 68 },
  { playerId: "p8", name: "VoltEdge", tag: "#8811", points: 5900, wins: 13, matches: 23, accuracy: 65 },
  { playerId: "p9", name: "DataPulse", tag: "#2200", points: 5100, wins: 11, matches: 20, accuracy: 62 },
  { playerId: "p10", name: "SynthRider", tag: "#6677", points: 4300, wins: 9, matches: 18, accuracy: 58 },
  { playerId: "p11", name: "NeoBlade", tag: "#4455", points: 3600, wins: 7, matches: 15, accuracy: 55 },
  { playerId: "p12", name: "Circuitry", tag: "#1100", points: 2800, wins: 5, matches: 12, accuracy: 50 },
];

function scale(players: Omit<RankedPlayer, "rank">[], factor: number): RankedPlayer[] {
  return players
    .map((p) => ({
      ...p,
      points: Math.round(p.points * factor),
      wins: Math.round(p.wins * factor),
      matches: Math.round(p.matches * factor),
    }))
    .sort((a, b) => b.points - a.points)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

const delay = () => new Promise((r) => setTimeout(r, 400));

export async function mockGetRanking(period: RankingPeriod): Promise<RankedPlayer[]> {
  await delay();
  switch (period) {
    case "weekly":
      return scale(BASE_PLAYERS, 0.3);
    case "monthly":
      return scale(BASE_PLAYERS, 0.7);
    case "alltime":
      return scale(BASE_PLAYERS, 1);
  }
}
