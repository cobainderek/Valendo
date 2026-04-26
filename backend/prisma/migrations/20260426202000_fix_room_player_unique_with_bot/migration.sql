-- DropIndex
DROP INDEX IF EXISTS "room_players_room_id_user_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "room_players_room_id_user_id_is_bot_key" ON "room_players"("room_id", "user_id", "is_bot");
