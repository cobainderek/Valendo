"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, GraduationCap } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? "/dashboard" : "/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background edu-pattern">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
        <GraduationCap className="h-10 w-10 text-white" />
      </div>
      <Loader2 className="h-6 w-6 animate-spin text-white/60" />
    </div>
  );
}
