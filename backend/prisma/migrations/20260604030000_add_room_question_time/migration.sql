-- Tempo por pergunta (segundos) configurado pelo host na criação da sala.
ALTER TABLE "rooms" ADD COLUMN "question_time" INTEGER NOT NULL DEFAULT 20;
