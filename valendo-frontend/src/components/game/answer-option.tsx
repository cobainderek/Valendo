"use client";

import { Check, X } from "lucide-react";

interface AnswerOptionProps {
  id: string;
  text: string;
  label: string;
  selected: boolean;
  correct?: boolean | null;
  revealed: boolean;
  disabled: boolean;
  onSelect: (id: string) => void;
}

export function AnswerOption({
  id,
  text,
  label,
  selected,
  correct,
  revealed,
  disabled,
  onSelect,
}: AnswerOptionProps) {
  let borderColor = "border-border hover:border-brand-blue/40";
  let bgColor = "bg-white hover:bg-brand-blue/5";
  let labelBg = "bg-secondary/70 text-muted-foreground";
  let icon = null;

  if (selected && !revealed) {
    borderColor = "border-brand-blue/60";
    bgColor = "bg-brand-blue/10";
    labelBg = "bg-brand-blue/20 text-brand-blue";
  }

  if (revealed) {
    if (correct === true) {
      borderColor = "border-brand-green/60";
      bgColor = "bg-brand-green/10";
      labelBg = "bg-brand-green/20 text-brand-green";
      icon = <Check className="h-6 w-6 text-brand-green" />;
    } else if (selected && correct === false) {
      borderColor = "border-destructive/60";
      bgColor = "bg-destructive/10";
      labelBg = "bg-destructive/20 text-destructive";
      icon = <X className="h-6 w-6 text-destructive" />;
    } else {
      borderColor = "border-border/20";
      bgColor = "bg-card/30 opacity-50";
    }
  }

  return (
    <button
      onClick={() => onSelect(id)}
      disabled={disabled}
      className={`flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all ${borderColor} ${bgColor} ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold ${labelBg}`}>
        {label}
      </span>
      <span className="flex-1 text-base font-medium">{text}</span>
      {icon}
    </button>
  );
}
