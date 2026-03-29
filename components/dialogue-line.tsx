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
        "border-2 p-2",
        isYou
          ? "border-sky-700/80 bg-sky-950/40 text-right"
          : "border-chart-1/80 bg-chart-1/15 text-left"
      )}
    >
      <p
        className={cn(
          "retro mb-1 text-[9px] uppercase tracking-wide",
          isYou ? "text-sky-300/90" : "text-chart-1"
        )}
      >
        {speaker}
      </p>
      <p className="retro text-[10px] leading-relaxed text-foreground">{children}</p>
    </div>
  );
}
