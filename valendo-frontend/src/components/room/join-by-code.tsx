"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Hash, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JoinByCodeProps {
  onJoin: (code: string) => Promise<void>;
}

export function JoinByCode({ onJoin }: JoinByCodeProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Digite o codigo da sala.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onJoin(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar na sala.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-white card-shadow p-3">
      <form onSubmit={handleSubmit} className="flex items-start gap-2">
        <div className="relative flex-1">
          <Hash className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="CODIGO DA SALA"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            className="h-11 rounded-lg border-border bg-secondary/50 pl-10 font-mono text-sm uppercase tracking-[0.2em] text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-brand-blue/40"
          />
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-11 gap-2 rounded-lg bg-brand-blue px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-blue/90"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
