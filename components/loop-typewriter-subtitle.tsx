"use client";

import TypewriterText from "@/components/smoothui/typewriter-text";

const SUBTITLE = "Lies, Lies, Mystery";

export function LoopTypewriterSubtitle() {
  return (
    <TypewriterText
      loop
      speed={90}
      className="mt-2 block text-3xl font-semibold tracking-tight text-muted-foreground sm:text-4xl md:text-5xl lg:text-4xl"
    >
      {SUBTITLE}
    </TypewriterText>
  );
}
