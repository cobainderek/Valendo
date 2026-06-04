-- Quantidade de perguntas do duelo, configurada pelo host na criação da sala.
ALTER TABLE "rooms" ADD COLUMN "num_questions" INTEGER NOT NULL DEFAULT 10;
