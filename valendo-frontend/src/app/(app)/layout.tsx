"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, GraduationCap, Swords, Trophy, User } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Salas", icon: Swords },
    { href: "/ranking", label: "Ranking", icon: Trophy },
    { href: "/profile", label: "Perfil", icon: User },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-navy edu-pattern">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
          <span className="font-mono text-sm text-white/60">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-brand-navy edu-pattern">
      {/* Nav */}
      <nav className="relative z-10 border-b border-white/10 bg-brand-dark/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <GraduationCap className="h-5 w-5 text-brand-orange" />
            </div>
            <span className="font-mono text-xl font-black tracking-widest">
              <span className="text-white">Valen</span>
              <span className="text-brand-orange">do!</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? "bg-brand-blue/20 text-white"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-6">
        {children}
      </main>
    </div>
  );
}
