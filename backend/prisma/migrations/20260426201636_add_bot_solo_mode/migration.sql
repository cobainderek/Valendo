-- AlterTable
ALTER TABLE "room_players" ADD COLUMN     "bot_name" VARCHAR(50),
ADD COLUMN     "is_bot" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "is_solo_mode" BOOLEAN NOT NULL DEFAULT false;
