export interface User {
  id: string;
  name: string;
  email: string;
  tag: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// --- Rooms ---

export type RoomStatus = "waiting" | "playing" | "finished";

export interface RoomPlayer {
  id: string;
  name: string;
  tag: string;
  isReady: boolean;
}

export interface Room {
  id: string;
  code: string;
  theme: string;
  rounds: number;
  maxPlayers: number;
  isPrivate: boolean;
  status: RoomStatus;
  owner: string;
  players: RoomPlayer[];
  created_at: string;
}

export interface CreateRoomPayload {
  theme: string;
  rounds: number;
  maxPlayers: number;
  isPrivate: boolean;
}

// --- Socket Events ---

export interface SocketPlayerJoined {
  player: RoomPlayer;
}

export interface SocketPlayerLeft {
  playerId: string;
}

export interface SocketPlayerReady {
  playerId: string;
  isReady: boolean;
}

export interface SocketGameStart {
  roomId: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface SocketQuestion {
  questionId: string;
  text: string;
  options: QuestionOption[];
  round: number;
  totalRounds: number;
  timeLimit: number;
}

export interface SocketAnswer {
  questionId: string;
  optionId: string;
}

export interface SocketTimerTick {
  remaining: number;
}

export interface PlayerRoundResult {
  playerId: string;
  name: string;
  correct: boolean;
  optionId: string;
  points: number;
  totalPoints: number;
}

export interface SocketRoundResult {
  questionId: string;
  correctOptionId: string;
  players: PlayerRoundResult[];
}

export interface PlayerFinalResult {
  playerId: string;
  name: string;
  tag: string;
  totalPoints: number;
  correctAnswers: number;
  rank: number;
}

export interface SocketGameEnd {
  players: PlayerFinalResult[];
}

// --- Ranking ---

export type RankingPeriod = "weekly" | "monthly" | "alltime";

export interface RankedPlayer {
  rank: number;
  playerId: string;
  name: string;
  tag: string;
  points: number;
  wins: number;
  matches: number;
  accuracy: number;
}

// --- Profile ---

export interface PlayerStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracy: number;
  bestStreak: number;
  totalPoints: number;
}

export type MatchResult = "win" | "loss" | "draw";

export interface MatchHistoryEntry {
  id: string;
  theme: string;
  result: MatchResult;
  points: number;
  correctAnswers: number;
  totalQuestions: number;
  opponent: string;
  date: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  email: string;
  tag: string;
  avatar: string;
  created_at: string;
  stats: PlayerStats;
  recentMatches: MatchHistoryEntry[];
}

// --- Gemini Questions ---

export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface GeneratedQuestion {
  text: string;
  options: { id: string; text: string }[];
  correctId: string;
  theme: string;
  difficulty: QuestionDifficulty;
}

export interface GenerateQuestionsRequest {
  theme: string;
  difficulty: QuestionDifficulty;
  count: number;
  exclude?: string[];
}
