"use client";

import { useState } from "react";
import { Pencil, Check, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PlayerProfile } from "@/types";
import { AVATARS } from "@/lib/mock-profile";

interface ProfileCardProps {
  profile: PlayerProfile;
  onSave: (data: { name: string; avatar: string }) => Promise<void>;
}

export function ProfileCard({ profile, onSave }: ProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [saving, setSaving] = useState(false);

  const joinDate = new Date(profile.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ name, avatar });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setName(profile.name);
    setAvatar(profile.avatar);
    setEditing(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white card-shadow">
      <div className="h-1 w-full bg-gradient-to-r from-brand-blue via-brand-orange to-brand-blue" />
      <div className="p-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-blue/10 text-4xl">
              {avatar}
            </div>
            {editing && (
              <div className="grid grid-cols-6 gap-1.5">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatar(a)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-all ${
                      avatar === a
                        ? "bg-brand-blue/20 ring-2 ring-brand-blue"
                        : "bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            {editing ? (
              <div className="space-y-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl border-border/40 bg-background/60 text-lg font-bold focus-visible:ring-2 focus-visible:ring-brand-blue/50"
                />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-black text-brand-blue">{profile.name}</h2>
                <span className="font-mono text-sm text-muted-foreground">{profile.tag}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Membro desde {joinDate}
            </div>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>

          {/* Edit toggle */}
          <div>
            {editing ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || name.length < 3}
                  className="gap-1.5 rounded-lg bg-brand-blue font-semibold text-white hover:bg-brand-blue/90"
                >
                  <Check className="h-4 w-4" />
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="gap-1.5 rounded-lg border-border/40"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
                className="gap-1.5 rounded-lg border-brand-blue/30 bg-brand-blue/5 text-brand-blue font-semibold hover:border-brand-blue/50 hover:bg-brand-blue/10"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
