"use client";

import { type SubmitEvent, useEffect, useRef, useState } from "react";

import { DialogueLine } from "@/components/dialogue-line";
import { Input } from "@/components/ui/8bit/input";
import { Spinner } from "@/components/ui/8bit/spinner";

import { useCase } from "@/lib/case-context";

const REPLY_DELAY_MS = 1800;
import type { CaseData, InterrogationChatMessage } from "@/lib/types/case";

type ChatLine = { id: string; speaker: string; text: string };

function storageKey(caseId: string, suspectId: string) {
  return `interrogation:${caseId}:${suspectId}`;
}

function linesToApiMessages(lines: ChatLine[]): InterrogationChatMessage[] {
  return lines.map((line) => ({
    role: line.speaker === "You" ? ("user" as const) : ("assistant" as const),
    content: line.text,
  }));
}

type InterrogationChatProps = {
  caseId: string | null;
  suspectId: string;
  suspectIndex: number;
  suspectName: string;
  caseData: CaseData | null;
  story: string | null;
};

export function InterrogationChat({
  caseId,
  suspectId,
  suspectIndex,
  suspectName,
  caseData,
  story,
}: InterrogationChatProps) {
  const [messages, setMessages] = useState<ChatLine[]>([]); // used in one suspect dialogue
  const [draft, setDraft] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const { actionsRemaining, decrementAction } = useCase();
  const isOutOfActions = actionsRemaining <= 0;

  useEffect(() => {
    setStorageReady(false);
    if (!caseId) {
      setMessages([]);
      setStorageReady(true);
      return;
    }
    const key = storageKey(caseId, suspectId);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (row) =>
              row &&
              typeof row === "object" &&
              "id" in row &&
              "speaker" in row &&
              "text" in row
          )
        ) {
          setMessages(parsed as ChatLine[]);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
    setStorageReady(true);
  }, [caseId, suspectId]);

  useEffect(() => {
    if (!storageReady || !caseId) return;
    const key = storageKey(caseId, suspectId);

    //store chat history in the local storage
    localStorage.setItem(key, JSON.stringify(messages));

    //the component may unmount/remount or you get a fresh mount; state would start at [] without localStorage
  }, [messages, caseId, suspectId, storageReady]);

  useEffect(() => {
    transcriptRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length, isResponding]);

  const canQuery =
    caseId !== null && caseData !== null && story !== null && story !== "";

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || isResponding) return;
    if (actionsRemaining <= 0) return;

    if (!canQuery) {
      setFetchError("Case data is not loaded. Return to the case file and start again.");
      return;
    }

    setFetchError(null);

    const userLine: ChatLine = {
      id: crypto.randomUUID(),
      speaker: "You",
      text,
    };
    const nextLines = [...messages, userLine];
    setMessages(nextLines);
    setDraft("");
    setIsResponding(true);
    decrementAction();

    const apiMessages = linesToApiMessages(nextLines);

    try {
      const res = await fetch("/api/interrogation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story,
          caseData,
          suspectIndex,
          messages: apiMessages,
        }),
      });
      const data: { reply?: string; error?: string } = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }
      const replyText = data.reply?.trim();
      if (!replyText) {
        throw new Error("Empty reply from server");
      }
      const suspectLine: ChatLine = {
        id: crypto.randomUUID(),
        speaker: suspectName,
        text: replyText,
      };
      setMessages((prev) => [...prev, suspectLine]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setFetchError(message);
      setMessages((prev) => prev.slice(0, -1));
      setDraft(text);
    } finally {
      setIsResponding(false);
    }
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
          aria-label="Your message"
          disabled={isResponding || isOutOfActions || !canQuery}
          placeholder={isOutOfActions ? "No actions left - accuse the culprit." : "Type what you want to say…"}
          className="h-8 w-full shrink-0 text-[9px] placeholder:text-[9px] disabled:opacity-60 sm:h-10 sm:text-[10px] sm:placeholder:text-[10px]"
        />
        {fetchError ? (
          <p className="retro mt-1 px-1 text-[9px] text-destructive">{fetchError}</p>
        ) : null}
      </form>
    </>
  );
}
