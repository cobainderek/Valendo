"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { mockGetProfile, mockUpdateProfile } from "@/lib/mock-profile";
import { PageTransition } from "@/components/ui/page-transition";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { ProfileCard } from "@/components/profile/profile-card";
import { StatsGrid } from "@/components/profile/stats-grid";
import { MatchHistory } from "@/components/profile/match-history";
import type { PlayerProfile } from "@/types";
import { User, BarChart3, History } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mockGetProfile();
      setProfile(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function handleSave(data: { name: string; avatar: string }) {
    await mockUpdateProfile(data);
    if (profile) {
      setProfile({ ...profile, name: data.name, avatar: data.avatar });
      toast.success("Perfil atualizado!");
    }
  }

  if (loading || !profile) return <ProfileSkeleton />;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/20" role="img" aria-label="Icone de perfil">
            <User className="h-6 w-6 text-brand-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Perfil</h1>
            <p className="text-sm text-white/60">Suas informacoes e estatisticas</p>
          </div>
        </div>

        {/* Profile card */}
        <ProfileCard profile={profile} onSave={handleSave} />

        {/* Stats */}
        <section aria-label="Estatisticas do jogador" className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-cyan" />
            <span className="text-sm font-bold uppercase tracking-wider text-white/80">Estatisticas</span>
          </div>
          <StatsGrid stats={profile.stats} />
        </section>

        {/* Match history */}
        <section aria-label="Historico de partidas" className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-brand-cyan" />
            <span className="text-sm font-bold uppercase tracking-wider text-white/80">Partidas Recentes</span>
          </div>
          <MatchHistory matches={profile.recentMatches} />
        </section>
      </div>
    </PageTransition>
  );
}
