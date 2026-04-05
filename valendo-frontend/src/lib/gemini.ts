import { api } from "./api";
import type { GeneratedQuestion, GenerateQuestionsRequest, QuestionDifficulty } from "@/types";
import { FALLBACK_QUESTIONS } from "./fallback-questions";

// ── Prompt template (used by backend, defined here for reference/mock) ──

export function buildPrompt(theme: string, difficulty: QuestionDifficulty, count: number): string {
  const diffLabel = { easy: "facil", medium: "medio", hard: "dificil" }[difficulty];

  return `Voce e um gerador de perguntas de quiz.
Gere exatamente ${count} perguntas de multipla escolha sobre o tema "${theme}" com dificuldade ${diffLabel}.

Regras:
- Cada pergunta deve ter exatamente 4 alternativas (A, B, C, D)
- Apenas 1 alternativa deve estar correta
- As alternativas erradas devem ser plausíveis
- Perguntas devem ser objetivas e ter resposta unica
- Nao repita perguntas
- Responda APENAS em JSON valido, sem markdown

Formato de resposta (JSON array):
[
  {
    "text": "Pergunta aqui?",
    "options": [
      { "id": "a", "text": "Alternativa A" },
      { "id": "b", "text": "Alternativa B" },
      { "id": "c", "text": "Alternativa C" },
      { "id": "d", "text": "Alternativa D" }
    ],
    "correctId": "b"
  }
]`;
}

// ── Validation ──

export function validateQuestions(data: unknown): GeneratedQuestion[] | null {
  if (!Array.isArray(data)) return null;

  const valid: GeneratedQuestion[] = [];

  for (const item of data) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.text !== "string" ||
      !item.text.trim() ||
      !Array.isArray(item.options) ||
      item.options.length !== 4 ||
      typeof item.correctId !== "string"
    ) {
      continue;
    }

    const optionsValid = item.options.every(
      (o: unknown) =>
        typeof o === "object" &&
        o !== null &&
        typeof (o as { id: string }).id === "string" &&
        typeof (o as { text: string }).text === "string" &&
        (o as { text: string }).text.trim() !== ""
    );

    if (!optionsValid) continue;

    const optionIds = item.options.map((o: { id: string }) => o.id);
    if (!optionIds.includes(item.correctId)) continue;

    valid.push({
      text: item.text,
      options: item.options,
      correctId: item.correctId,
      theme: "",
      difficulty: "medium",
    });
  }

  return valid.length > 0 ? valid : null;
}

// ── Cache (session-level, avoids repeat questions) ──

const sessionCache = new Map<string, GeneratedQuestion[]>();
const usedQuestions = new Set<string>();

function getCacheKey(theme: string, difficulty: QuestionDifficulty): string {
  return `${theme}::${difficulty}`;
}

function addToCache(theme: string, difficulty: QuestionDifficulty, questions: GeneratedQuestion[]) {
  const key = getCacheKey(theme, difficulty);
  const existing = sessionCache.get(key) || [];
  sessionCache.set(key, [...existing, ...questions]);
}

function getFromCache(theme: string, difficulty: QuestionDifficulty, count: number): GeneratedQuestion[] | null {
  const key = getCacheKey(theme, difficulty);
  const cached = sessionCache.get(key) || [];
  const unused = cached.filter((q) => !usedQuestions.has(q.text));
  if (unused.length >= count) {
    const selected = unused.slice(0, count);
    selected.forEach((q) => usedQuestions.add(q.text));
    return selected;
  }
  return null;
}

export function markQuestionUsed(text: string) {
  usedQuestions.add(text);
}

export function clearQuestionCache() {
  sessionCache.clear();
  usedQuestions.clear();
}

// ── Main API ──

export async function generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
  const { theme, difficulty, count } = request;

  // 1. Try cache first
  const cached = getFromCache(theme, difficulty, count);
  if (cached) return cached;

  // 2. Try backend API (which calls Gemini)
  try {
    const data = await api<unknown>("/questions/generate", {
      method: "POST",
      body: { theme, difficulty, count, exclude: Array.from(usedQuestions) },
    });

    const validated = validateQuestions(data);
    if (validated) {
      const enriched = validated.map((q) => ({ ...q, theme, difficulty }));
      addToCache(theme, difficulty, enriched);
      const selected = enriched.slice(0, count);
      selected.forEach((q) => usedQuestions.add(q.text));
      return selected;
    }
  } catch {
    // API failed, fall through to fallback
  }

  // 3. Fallback to pre-built questions
  return getFallbackQuestions(theme, count);
}

function getFallbackQuestions(theme: string, count: number): GeneratedQuestion[] {
  const themeQuestions = FALLBACK_QUESTIONS[theme] || FALLBACK_QUESTIONS["Geral"];
  const unused = themeQuestions.filter((q) => !usedQuestions.has(q.text));
  const selected = unused.length >= count ? unused.slice(0, count) : themeQuestions.slice(0, count);
  selected.forEach((q) => usedQuestions.add(q.text));
  return selected;
}
