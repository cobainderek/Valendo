"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, KeyRound, User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }

    if (name.length < 3) {
      setError("O nome deve ter pelo menos 3 caracteres.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email invalido.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white card-shadow-lg">
      <div className="space-y-8 p-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-mono text-3xl font-black">
            <span className="text-brand-blue">Valen</span>
            <span className="text-brand-orange">do!</span>
          </h1>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-brand-green" />
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-green">
              CRIE SUA CONTA
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4 text-brand-blue/60" />
              Nome
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl border-blue-200 bg-white px-4 text-base focus-visible:ring-2 focus-visible:ring-brand-blue/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail className="h-4 w-4 text-brand-blue/60" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Seu email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-blue-200 bg-white px-4 text-base focus-visible:ring-2 focus-visible:ring-brand-blue/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <KeyRound className="h-4 w-4 text-brand-blue/60" />
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl border-blue-200 bg-white px-4 text-base focus-visible:ring-2 focus-visible:ring-brand-blue/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <KeyRound className="h-4 w-4 text-brand-blue/60" />
              Confirmar Senha
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 rounded-xl border-blue-200 bg-white px-4 text-base focus-visible:ring-2 focus-visible:ring-brand-blue/50"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-brand-blue text-base font-bold uppercase tracking-wider text-white transition-all hover:bg-brand-blue/90"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "CRIAR CONTA"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="pt-2 text-center">
          <p className="text-sm text-gray-500">
            Ja tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-blue transition-all hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
