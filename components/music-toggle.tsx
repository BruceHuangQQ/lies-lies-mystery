"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Music } from "lucide-react";

import { Toggle } from "@/components/ui/8bit/toggle";

const AUDIO_SRC = "/music/bgm.mp3";

export function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Always start enabled. We intentionally do NOT persist to localStorage to avoid hydration mismatches.
  const [enabled, setEnabled] = useState(true);

  const enabledRef = useRef(enabled);
  const hasTriedUnmuteRef = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const label = useMemo(() => (enabled ? "Music: ON" : "Music: OFF"), [enabled]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    if (!enabled) {
      el.pause();
      el.currentTime = 0;
      hasTriedUnmuteRef.current = false;
      return;
    }

    // Autoplay with sound is often blocked; try muted first.
    el.loop = true;
    el.currentTime = 0;
    el.muted = true;

    void el.play().catch(() => {
      // If even muted autoplay is blocked, user interaction is required.
    });

    // Unmute on the first user gesture (best effort), but only once per enable cycle.
    if (!hasTriedUnmuteRef.current) {
      hasTriedUnmuteRef.current = true;

      const onGesture = () => {
        const cur = audioRef.current;
        if (!cur) return;
        if (!enabledRef.current) return;

        cur.muted = false;
        cur.currentTime = 0;
        cur.loop = true;
        void cur.play().catch(() => {
          // If unmute fails, we keep the audio muted but playing (best effort).
        });
      };

      window.addEventListener("pointerdown", onGesture, { once: true });
      window.addEventListener("keydown", onGesture, { once: true });
    }
  }, [enabled]);

  function handleToggle(next: boolean) {
    setEnabled(next);

    const el = audioRef.current;
    if (!el) return;

    if (!next) {
      el.pause();
      el.currentTime = 0;
      return;
    }

    // Toggle click is a user gesture: try unmuted playback immediately.
    hasTriedUnmuteRef.current = false;
    el.loop = true;
    el.currentTime = 0;
    el.muted = false;
    void el.play().catch(() => {
      // If it fails, the effect will still attempt muted autoplay and unmute later.
    });
  }

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} preload="auto" />
      <div className="z-50">
        <Toggle
          pressed={enabled}
          onPressedChange={handleToggle}
          aria-label="Toggle background music"
          variant="outline"
          size="sm"
          className="bg-background/60 backdrop-blur-sm"
        >
          <Music className="size-4" aria-hidden />
          <span className="sr-only">{label}</span>
        </Toggle>
      </div>
    </>
  );
}

