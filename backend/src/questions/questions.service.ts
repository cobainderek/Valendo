import { Injectable, BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateQuestionsDto } from './dto/create-question.dto';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import Redis from 'ioredis';
const pdfParse = require('pdf-parse');

@Injectable()
export class QuestionsService {
  private ai: GoogleGenAI;
  private redis: Redis;
  private cachedSystemInstruction: string = '';

  constructor(private prisma: PrismaService) {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY',
    });
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.loadSystemInstruction();
  }

  private loadSystemInstruction() {
    try {
      const promptPath = path.join(__dirname, 'prompts', 'system-instruction.txt');
      this.cachedSystemInstruction = fs.readFileSync(promptPath, 'utf8');
    } catch (err) {
      console.warn('System instruction file not found, using default fallback.');
      this.cachedSystemInstruction = 'Você é um assistente educacional que cria perguntas objetivas claras baseadas estritamente no texto fornecido.';
    }
  }

  private sanitizeText(rawText: string): string {
    // Limpeza pesada para economizar tokens e ajudar a IA a focar no conteúdo principal
    return rawText
      .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove hidden characters
      .replace(/\s+/g, ' ') // Converte múltiplas quebras e tabs em um espaço só
      .trim();
  }

  async generateAndStore(hostId: bigint, dto: GenerateQuestionsDto, file?: Express.Multer.File) {
    // 1. Validar Sala e Host
    const room = await this.prisma.room.findUnique({
      where: { code: dto.roomCode },
    });

    if (!room) {
      throw new BadRequestException('Sala não encontrada.');
    }

    if (room.hostId !== hostId) {
      throw new UnauthorizedException('Apenas o Host pode gerar questões para esta sala.');
    }

    // Quantidade de perguntas configurada pelo host na criação da sala.
    const numQuestoes = room.numQuestions ?? 10;

    // 2. Extrair Contexto Base
    // O prompt diferencia TEMA (título curto → IA usa conhecimento geral)
    // de MATERIAL (texto extraído de PDF → perguntas saem do conteúdo).
    let baseContext = '';
    let isTema = false;
    let cacheKey: string | null = null;

    if (file) {
      try {
        const parsedPdf = await pdfParse(file.buffer);
        baseContext = this.sanitizeText(parsedPdf.text);
      } catch (err) {
        throw new BadRequestException('Falha ao extrair texto do PDF enviado.');
      }
    } else if (dto.theme) {
      baseContext = this.sanitizeText(dto.theme);
      isTema = true;
      // Criação de ID algoritimica determinístico MD5 como chave para cacheamento.
      // A quantidade entra na chave (v2): mudar o nº de perguntas não pode
      // reusar um quiz antigo de tamanho diferente.
      const hash = crypto.createHash('md5').update(baseContext).digest('hex');
      cacheKey = `valendo:quiz:v2:${hash}:${numQuestoes}`;
    } else {
      throw new BadRequestException('Você deve fornecer um tema em texto ou enviar um arquivo PDF.');
    }

    // 4. Schema JSON para forçar a tipagem do Gemini
    const questionSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "A pergunta a ser feita" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array com exatamente 4 opções de resposta"
              },
              correctAnswer: { type: Type.STRING, description: "A resposta correta EXATA (deve ser idêntica a uma das opções)" },
              explanationAi: { type: Type.STRING, description: "Curta explicação do porquê a resposta é a correta" }
            },
            required: ["text", "options", "correctAnswer", "explanationAi"]
          }
        }
      },
      required: ["questions"]
    };

    // 5. Invocação a Google Gemini API com Retry Pattern e Verificação de Redis Cache
    let parsedQuestions: any[] = [];
    let wasCachedHit = false;

    // Check hit rate on Redis RAM database (Less than 15ms resolution vs 10s LLM resolution)
    if (cacheKey) {
      try {
        const cachedVal = await this.redis.get(cacheKey);
        if (cachedVal) {
          parsedQuestions = JSON.parse(cachedVal);
          wasCachedHit = true;
        }
      } catch (e) {
        console.warn('Aviso: Redis indisponível no momento', e.message);
      }
    }

    // AI Generation Fallback Se não houver Cache
    if (parsedQuestions.length === 0) {
    let attempts = 0;
    const maxAttempts = 3; // Auto-retry para lidar com timeouts, JSON inválido ou quantidade errada
    let lastError: unknown = null;
    let melhorTentativa: any[] = []; // maior leva obtida, caso nenhuma bata a quantidade exata

    // O rótulo do conteúdo importa: um tema curto rotulado como "texto para
    // extração" fazia a IA gerar meta-perguntas ("Qual é o tema...?").
    const conteudo = isTema
      ? `TEMA DO DUELO: "${baseContext.substring(0, 500)}"`
      : `MATERIAL DE ESTUDO (texto extraído de PDF):\n\n"${baseContext.substring(0, 15000)}"`; // Gemini lida bem com mais texto que a baseline

    while (attempts < maxAttempts && parsedQuestions.length === 0) {
      try {
        attempts++;
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `QUANTIDADE DE QUESTÕES: ${numQuestoes}\n\n${conteudo}`,
          config: {
            systemInstruction: this.cachedSystemInstruction,
            responseMimeType: 'application/json',
            responseSchema: questionSchema,
            temperature: 0.7,
            topK: 40, // Maior determinação
          }
        });

        const jsonText = response.text || '';
        const payload = JSON.parse(jsonText);

        if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
          throw new Error('Payload retornado não contem um array de "questions".');
        }
        if (payload.questions.length > melhorTentativa.length) {
          melhorTentativa = payload.questions;
        }
        if (payload.questions.length >= numQuestoes) {
          parsedQuestions = payload.questions.slice(0, numQuestoes);
        } else {
          throw new Error(
            `IA retornou ${payload.questions.length} questões (pedido: ${numQuestoes}).`,
          );
        }
      } catch (e) {
        lastError = e;
        console.warn(`Tentativa ${attempts} de gerar questões falhou. Tentando novamente se aplicável...`);
      }
    }

    // Última linha de defesa: aceitar uma leva incompleta razoável (>= 3)
    // em vez de derrubar o início da partida.
    if (parsedQuestions.length === 0 && melhorTentativa.length >= 3) {
      console.warn(
        `Usando melhor tentativa com ${melhorTentativa.length}/${numQuestoes} questões.`,
      );
      parsedQuestions = melhorTentativa;
    }

    if (parsedQuestions.length === 0) {
      console.error(lastError);
      throw new InternalServerErrorException('A IA falhou em processar e formular as questões após múltiplas tentativas.');
    }

    // Persistir o novo payload na Redis se recem processado e rastreavel validamente
    if (!wasCachedHit && cacheKey && parsedQuestions.length > 0) {
      try {
         // Salvar e segurar ativo por exatos 7 Dias na ram (604800 segundos)
         await this.redis.set(cacheKey, JSON.stringify(parsedQuestions), 'EX', 604800);
      } catch(e) { /* background failure silent swallow */ }
    }
    } // <-- Fim do bloco if (parsedQuestions.length === 0)

    // 6. Associar ao Duel da Sala (Cria se não existir)
    let duel = await this.prisma.duel.findUnique({
      where: { roomId: room.id },
    });

    if (!duel) {
      duel = await this.prisma.duel.create({
        data: {
          roomId: room.id,
          totalRounds: parsedQuestions.length,
        },
      });
    } else {
      // Re-geração: substitui as questões antigas em vez de acumular.
      // Isso evita perguntas duplicadas e um totalRounds inflado/divergente
      // da contagem real de questões.
      await this.prisma.answer.deleteMany({
        where: { question: { duelId: duel.id } },
      });
      await this.prisma.question.deleteMany({ where: { duelId: duel.id } });
      duel = await this.prisma.duel.update({
        where: { id: duel.id },
        data: { totalRounds: parsedQuestions.length },
      });
    }

    // 6. Persistência de Questões Array
    const mappedInserts = parsedQuestions.map((q) => ({
      duelId: duel.id,
      text: String(q.text),
      options: q.options, // Json field
      correctAnswer: String(q.correctAnswer),
      explanationAi: String(q.explanationAi),
    }));

    await this.prisma.question.createMany({
      data: mappedInserts,
    });

    return {
      message: `${mappedInserts.length} questões engatilhadas com sucesso (Fonte: ${wasCachedHit ? 'Redis Cache Memory' : 'Google Gemini AI'}).`,
      duelId: duel.id.toString(),
      roomId: room.id.toString(),
      cachedHit: wasCachedHit,
      questionsGenerated: parsedQuestions,
    };
  }
}
