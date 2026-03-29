"use client";

import { type SubmitEvent, useEffect, useRef, useState } from "react";

import { DialogueLine } from "@/components/dialogue-line";
import { Input } from "@/components/ui/8bit/input";
import { Spinner } from "@/components/ui/8bit/spinner";

const REPLY_DELAY_MS = 1800;

type ChatLine = { id: string; speaker: string; text: string };

export function InterrogationChat({ suspectName }: { suspectName: string }) {
  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [draft, setDraft] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    transcriptRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isResponding]);

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || isResponding) return;

    const userLine: ChatLine = {
      id: crypto.randomUUID(),
      speaker: "You",
      text,
    };
    setMessages((prev) => [...prev, userLine]);
    setDraft("");
    setIsResponding(true);

    //I asked AI to create a reply delay for suspects
    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    replyTimeoutRef.current = setTimeout(() => {
      replyTimeoutRef.current = null;
      const suspectLine: ChatLine = {
        id: crypto.randomUUID(),
        speaker: suspectName,
        text: "haha",
      };
      setMessages((prev) => [...prev, suspectLine]);
      setIsResponding(false);
    }, REPLY_DELAY_MS);
  }

  return (
    <>
      <div
        ref={transcriptRef}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 text-[10px]"
      >
        {messages.length === 0 && !isResponding ? (
          <p className="px-1 text-muted-foreground">Type a message to interrogate {suspectName}...</p>
        ) : (
          <>
            {messages.map((m) => (
              <DialogueLine key={m.id} speaker={m.speaker}>
                {m.text}
              </DialogueLine>
            ))}
            {isResponding ? (
              <DialogueLine speaker={suspectName}>
                <span className="inline-flex items-center text-chart-1">
                  <Spinner variant="diamond"/>
                </span>
              </DialogueLine>
            ) : null}
          </>
        )}
      </div>
      <form onSubmit={handleSubmit} className="shrink-0" aria-busy={isResponding}>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type what you want to say…"
          aria-label="Your message"
          disabled={isResponding}
          className="w-full shrink-0 disabled:opacity-60"
        />
      </form>
    </>
  );
}
