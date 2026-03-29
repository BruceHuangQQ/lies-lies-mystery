"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DialogueLine({
  speaker,
  children,
}: {
  speaker: string;
  children: ReactNode;
}) {
  const isYou = speaker.toLowerCase() === "you";
  return (
    <div
      className={cn(
        "border-2 border-sky-700/80 bg-sky-950/40 p-2",
        isYou ? "text-right" : "text-left"
      )}
    >
      <p className="retro mb-1 text-[9px] uppercase tracking-wide text-sky-300/90">{speaker}</p>
      <p className="retro text-[10px] leading-relaxed text-foreground">{children}</p>
    </div>
  );
}
