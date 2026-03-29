"use client";

import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/8bit/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/8bit/select";
import { DialogueLine } from "@/components/dialogue-line";
import { cn } from "@/lib/utils";

import caseContent from "@/data/case-file.json";

const SUSPECT_LAYOUT = [
  "left-[22%] bottom-0 h-[min(68%,480px)] w-[min(24%,300px)] -translate-x-1/2",
  "left-1/2 bottom-0 h-[min(68%,480px)] w-[min(24%,300px)] -translate-x-1/2",
  "left-[78%] bottom-0 h-[min(68%,480px)] w-[min(24%,300px)] -translate-x-1/2",
] as const;

export default function GamePage() {
  const suspects = caseContent.suspects;
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const selectedSuspect =
    selectedSuspectId === null ? null : suspects.find((s) => s.id === selectedSuspectId) ?? null;

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-3 py-6 sm:px-4">
      <div className="w-full max-w-6xl bg-background">
        <div className="relative w-full">
          <div className="border-4 border-double border-sky-600 bg-sky-950/5 p-1 dark:bg-sky-950/20">
            <div className="relative aspect-video w-full overflow-hidden border-4 border-sky-700">
              {/* TODO dynamic location */}
              <Image
                src="/location-bg/office.png"
                alt=""
                fill
                className="object-cover pixelated"
                priority
                sizes="(max-width: 896px) 100vw, 896px"
              />
              {selectedSuspect === null ? (
                suspects.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={s.name}
                    onClick={() => setSelectedSuspectId(s.id)}
                    className={cn(
                      "group absolute flex cursor-pointer items-end justify-center overflow-visible bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      SUSPECT_LAYOUT[i]
                    )}
                  >
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      className="object-contain object-bottom pixelated transition duration-150 ease-out group-hover:scale-[1.05] group-hover:brightness-110 group-hover:drop-shadow-md group-hover:-translate-y-0.5 group-active:scale-[0.98]"
                    />
                  </button>
                ))
              ) : (
                <div className="absolute inset-0 z-10 flex h-full w-full flex-row">
                  <div className="relative flex h-full min-h-0 flex-1 items-end justify-center">
                    <div className="relative mb-0 h-[min(68%,480px)] w-[min(42%,280px)]">
                      {/* TODO dynamic suspect */}
                      <Image
                        src={selectedSuspect.image}
                        alt=""
                        fill
                        className="object-contain object-bottom pixelated"
                        sizes="(max-width: 896px) 42vw, 280px"
                      />
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex h-full min-w-0 flex-1 flex-col gap-2 border-2 border-sky-700 bg-zinc-200 p-3 sm:p-4"
                    )}
                  >
                    <button
                      type="button"
                      aria-label="Back to suspects"
                      onClick={() => setSelectedSuspectId(null)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center bg-transparent cursor-pointer"
                    >
                      <Image
                        src="/arrow.png"
                        alt=""
                        width={32}
                        height={32}
                        className="pixelated"
                      />
                    </button>
                    <div className="retro flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 text-[10px]">
                      <DialogueLine speaker={selectedSuspect.name}>
                        (Dialogue will appear here during interrogation.)
                      </DialogueLine>
                      <DialogueLine speaker="You">…</DialogueLine>
                    </div>
                    <Input
                      placeholder="Type what you want to say…"
                      aria-label="Your message"
                      className="w-full shrink-0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex w-full flex-wrap justify-between gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="min-w-[10rem] px-6 py-5 text-sm">
                Access case file
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Case file</DialogTitle>
                <DialogDescription className="sr-only">
                  Story and how to play
                </DialogDescription>
              </DialogHeader>
              <p className="retro text-muted-foreground whitespace-pre-line text-[10px] leading-relaxed">
                {caseContent.story}
              </p>
              <DialogClose asChild>
                <Button variant="secondary" className="mt-2 w-full">
                  Close
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="min-w-[10rem] px-6 py-5 text-sm">
                Solve the case
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solve the case</DialogTitle>
                <DialogDescription className="sr-only">
                  Choose a suspect to accuse
                </DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <label htmlFor="accusation" className="retro text-[10px]">
                  Who is the murderer?
                </label>
                <Select>
                  <SelectTrigger id="accusation">
                    <SelectValue placeholder="Choose a suspect…" />
                  </SelectTrigger>
                  <SelectContent>
                    {suspects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="default" className="w-full">
                  Submit accusation
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
