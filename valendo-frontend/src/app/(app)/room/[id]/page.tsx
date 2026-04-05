"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useSocketContext } from "@/contexts/socket-context";
import { Button } from "@/components/ui/button";
import { PlayerList } from "@/components/room/player-list";
import { ConnectionStatus } from "@/components/room/connection-status";
import { mockGetRoom, mockToggleReady, mockLeaveRoom } from "@/lib/mock-rooms";
import type { Room } from "@/types";
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  Swords,
  Users,
  Repeat,
  Play,
  Shield,
  Lock,
} from "lucide-react";

export default function RoomLobbyPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { status: socketStatus } = useSocketContext();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const fetchRoom = useCallback(async () => {
    try {
      const data = await mockGetRoom(id);
      setRoom(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar sala.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  async function handleToggleReady() {
    if (!user) return;
    const updated = await mockToggleReady(id, user.id);
    setRoom(updated);
  }

  async function handleLeave() {
    if (!user) return;
    await mockLeaveRoom(id, user.id);
    router.push("/dashboard");
  }

  function handleCopyCode() {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-32">
        <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
        <span className="font-mono text-sm text-white/60">Entrando na sala...</span>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex flex-col items-center gap-6 py-32">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/20">
          <Swords className="h-10 w-10 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-red-400">{error || "Sala nao encontrada."}</p>
          <p className="mt-1 text-sm text-white/50">A sala pode ter sido encerrada</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="gap-2 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  const currentPlayer = room.players.find((p) => p.id === user?.id);
  const isOwner = room.owner === user?.id;
  const allReady = room.players.every((p) => p.isReady);
  const canStart = isOwner && allReady && room.players.length >= 2;

  return (
    <div className="mx-auto max-w-2xl space-y-5 pt-2">
      {/* Back + connection status */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleLeave}
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Sair da sala
        </button>
        <ConnectionStatus status={socketStatus} />
      </div>

      {/* Room header card */}
      <div className="overflow-hidden rounded-2xl bg-white card-shadow-lg">
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-blue via-brand-orange to-brand-blue" />

        <div className="p-6">
          {/* Title row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-blue/10">
                <Swords className="h-7 w-7 text-brand-blue" />
              </div>
              <div>
                <h1 className="text-xl font-black text-foreground">{room.theme}</h1>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {room.isPrivate && <Lock className="h-3.5 w-3.5 text-brand-orange" />}
                  <span className="text-sm text-muted-foreground">
                    {room.isPrivate ? "Sala privada" : "Sala publica"}
                  </span>
                </div>
              </div>
            </div>

            {/* Code badge */}
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 rounded-lg border border-brand-blue/20 bg-brand-blue/5 px-3 py-2 font-mono text-sm font-bold tracking-[0.2em] text-brand-blue transition-all hover:border-brand-blue/40 hover:bg-brand-blue/10"
            >
              {room.code}
              {copied ? (
                <Check className="h-4 w-4 text-brand-green" />
              ) : (
                <Copy className="h-4 w-4 opacity-50" />
              )}
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <Repeat className="h-4 w-4 text-brand-blue" />
              <div>
                <p className="text-[10px] text-muted-foreground">Rodadas</p>
                <p className="text-base font-bold text-foreground">{room.rounds}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <Users className="h-4 w-4 text-brand-orange" />
              <div>
                <p className="text-[10px] text-muted-foreground">Jogadores</p>
                <p className="text-base font-bold text-foreground">
                  {room.players.length}
                  <span className="text-xs font-normal text-muted-foreground">/{room.maxPlayers}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Players section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-brand-cyan" />
          <span className="text-sm font-bold uppercase tracking-wider text-white/80">Jogadores na sala</span>
        </div>
        <PlayerList players={room.players} ownerId={room.owner} />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {currentPlayer && (
          <Button
            onClick={handleToggleReady}
            className={`h-12 flex-1 gap-2 rounded-xl text-base font-bold transition-all ${
              currentPlayer.isReady
                ? "border-2 border-white/20 bg-white/10 text-white hover:bg-white/15"
                : "bg-brand-blue text-white shadow-md hover:bg-brand-blue/90"
            }`}
          >
            {currentPlayer.isReady ? (
              "Cancelar Pronto"
            ) : (
              <>
                <Check className="h-5 w-5" />
                Estou Pronto
              </>
            )}
          </Button>
        )}
        {canStart && (
          <Button
            onClick={() => router.push(`/room/${id}/play?theme=${encodeURIComponent(room.theme)}&rounds=${room.rounds}`)}
            className="h-12 flex-1 gap-2 rounded-xl bg-brand-orange text-base font-bold text-white shadow-md transition-all hover:bg-brand-orange-dark"
          >
            <Play className="h-5 w-5" />
            Iniciar Partida
          </Button>
        )}
      </div>

      {/* Status message */}
      {isOwner && !canStart && (
        <div className="border-pulse-blue rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center">
          <p className="text-sm text-white/60">
            {room.players.length < 2
              ? "Compartilhe o codigo da sala para convidar jogadores..."
              : "Aguardando todos os jogadores ficarem prontos..."}
          </p>
        </div>
      )}
    </div>
  );
}
