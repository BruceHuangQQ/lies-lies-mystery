"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import TypewriterText from "@/components/smoothui/typewriter-text";
import { cn } from "@/lib/utils";

export interface TutorialSubtitleTypewriterProps {
  lines: readonly string[];
  speed?: number;
  pauseBetweenLinesMs?: number;
  className?: string;
}

export function TutorialSubtitleTypewriter({
  lines,
  speed = 32,
  pauseBetweenLinesMs = 480,
  className,
}: TutorialSubtitleTypewriterProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const lineIndexRef = useRef(0);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    lineIndexRef.current = lineIndex;
  }, [lineIndex]);

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  // After that line is fully typed, onComplete runs
  // you wait pauseBetweenLinesMs, then lineIndex increases by 1.
  const handleLineComplete = useCallback(() => {
    const current = lineIndexRef.current;
    if (current >= lines.length - 1) {
      setLineIndex(lines.length);
      return;
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setLineIndex(current + 1);
    }, pauseBetweenLinesMs);
  }, [lines.length, pauseBetweenLinesMs]);

  return (
    <div className={cn("space-y-1 text-center", className)} aria-live="polite">
      {/* the growing list of lines, after the typewrite finished, the line goes here */}
      {lines.slice(0, lineIndex).map((line, i) => (
        <p key={`done-${i}-${line}`} className="leading-snug">
          {line}
        </p>
      ))}

      {/* render each line */}
      {lineIndex < lines.length && (
        <p className="leading-snug">
          <TypewriterText
            key={`${lineIndex}-${lines[lineIndex]}`}
            speed={speed}
            onComplete={handleLineComplete}
          >
            {lines[lineIndex]!}
          </TypewriterText>
        </p>
      )}
    </div>
  );
}
