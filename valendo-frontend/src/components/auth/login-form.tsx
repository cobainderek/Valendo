"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, User, KeyRound, Swords, Gamepad2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email invalido.");
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestLogin() {
    setError("");
    setGuestLoading(true);
    try {
      await login({ email: "guest@valendo.app", password: "guest123" });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar como convidado.");
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl bg-white p-8 card-shadow-lg">
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="font-mono text-3xl font-bold">
            <span className="text-[#2B5EA7]">Valen</span>
            <span className="text-[#F5A623]">do!</span>
          </h1>
          <div className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3 text-[#4CAF50]" />
            <p className="text-xs uppercase tracking-widest text-[#4CAF50] font-semibold">
              Aprenda Duelando
            </p>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#5BBCE4]">
            <User className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C5D5E8]" />
            <Input
              id="email"
              type="email"
              placeholder="Seu apelido..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-[#C5D5E8] bg-white pl-10 pr-4 text-base placeholder:text-[#C5D5E8] focus-visible:ring-2 focus-visible:ring-[#2B5EA7]/30"
            />
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C5D5E8]" />
            <Input
              id="password"
              type="password"
              placeholder="Senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl border-[#C5D5E8] bg-white pl-10 pr-4 text-base placeholder:text-[#C5D5E8] focus-visible:ring-2 focus-visible:ring-[#2B5EA7]/30"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-[#2B5EA7] text-base font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#244e8a]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Swords className="mr-2 h-5 w-5" />
                Entrar na Disputa
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[#C5D5E8]" />
          <span className="text-sm text-gray-400">ou</span>
          <div className="h-px flex-1 bg-[#C5D5E8]" />
        </div>

        {/* Guest Button */}
        <Button
          type="button"
          disabled={guestLoading}
          onClick={handleGuestLogin}
          className="h-12 w-full rounded-xl bg-[#F5A623] text-base font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#db9520]"
        >
          {guestLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Gamepad2 className="mr-2 h-5 w-5" />
              Entrar como Convidado
            </>
          )}
        </Button>

        {/* Footer */}
        <div className="pt-2 text-center">
          <p className="text-sm text-gray-500">
            Novo por aqui?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#2B5EA7] transition-all hover:underline"
            >
              Criar conta gratis &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
