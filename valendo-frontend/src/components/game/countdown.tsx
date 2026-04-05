"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
      <p className="font-mono text-sm font-medium tracking-widest text-muted-foreground uppercase">
        A partida vai comecar
      </p>
      <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-white card-shadow-lg">
        <span className="font-mono text-8xl font-black text-brand-blue">
          {count || "GO"}
        </span>
      </div>
    </div>
  );
}
