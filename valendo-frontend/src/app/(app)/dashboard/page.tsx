"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { RoomCard } from "@/components/room/room-card";
import { CreateRoomModal } from "@/components/room/create-room-modal";
import { JoinByCode } from "@/components/room/join-by-code";
import { mockListRooms, mockCreateRoom, mockJoinRoom, mockJoinByCode } from "@/lib/mock-rooms";
import type { Room, CreateRoomPayload } from "@/types";
import { LogOut, Plus, RefreshCw, Swords, Hash, GraduationCap } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mockListRooms();
      setRooms(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const currentPlayer = {
    id: user?.id ?? "",
    name: user?.name ?? "",
    tag: user?.tag ?? "",
    isReady: false,
  };

  async function handleCreate(payload: CreateRoomPayload) {
    const room = await mockCreateRoom(payload, { ...currentPlayer, isReady: true });
    toast.success("Sala criada com sucesso!");
    router.push(`/room/${room.id}`);
  }

  async function handleJoin(roomId: string) {
    setJoiningId(roomId);
    try {
      await mockJoinRoom(roomId, currentPlayer);
      toast.success("Entrando na sala...");
      router.push(`/room/${roomId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar na sala.");
    } finally {
      setJoiningId(null);
    }
  }

  async function handleJoinByCode(code: string) {
    const room = await mockJoinByCode(code, currentPlayer);
    toast.success("Entrando na sala...");
    router.push(`/room/${room.id}`);
  }

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Hero header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/20" role="img" aria-label="Icone do dashboard">
              <GraduationCap className="h-6 w-6 text-brand-orange" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Ola, <span className="text-brand-orange">{user?.name}</span>
              </h1>
              <p className="text-sm text-white/60">Pronto para um duelo?</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            aria-label="Sair da conta"
            className="gap-2.5 self-start rounded-xl border-white/20 bg-white/5 px-5 py-2.5 text-white/80 transition-all hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            <span className="sm:inline">Sair</span>
          </Button>
        </div>

        {/* Join by code section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-brand-cyan" />
            <span className="text-sm font-bold uppercase tracking-wider text-white/80">Entrar por codigo</span>
          </div>
          <JoinByCode onJoin={handleJoinByCode} />
        </div>

        {/* Room list section */}
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-brand-orange" />
              <span className="text-base font-bold uppercase tracking-wider text-white">Salas abertas</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchRooms}
                aria-label="Atualizar lista de salas"
                className="gap-2 rounded-xl border-white/20 bg-white/5 px-4 text-white/80 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
              <Button
                onClick={() => setShowCreate(true)}
                aria-label="Criar nova sala"
                className="gap-2 rounded-xl bg-brand-orange px-6 font-bold text-white shadow-md transition-all hover:bg-brand-orange-dark hover:shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Criar Sala
              </Button>
            </div>
          </div>

          {rooms.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white py-16 text-center card-shadow sm:py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <Swords className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Nenhuma sala aberta</p>
                <p className="mt-1 text-sm text-muted-foreground">Crie a primeira e convide seus amigos!</p>
              </div>
              <Button
                onClick={() => setShowCreate(true)}
                className="mt-2 gap-2 rounded-xl bg-brand-orange px-6 font-bold text-white shadow-md hover:bg-brand-orange-dark hover:shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Criar Sala
              </Button>
            </div>
          ) : (
            <div className="space-y-3" role="list" aria-label="Lista de salas">
              {rooms.map((room) => (
                <div key={room.id} role="listitem">
                  <RoomCard
                    room={room}
                    onJoin={handleJoin}
                    loading={joiningId === room.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <CreateRoomModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      </div>
    </PageTransition>
  );
}
