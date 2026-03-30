"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { InterrogationChat } from "@/components/interrogation-chat";
import { Button } from "@/components/ui/8bit/button";
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
import { cn } from "@/lib/utils";

import caseContent from "@/data/case-file.json";
import gameData from "@/data/game-data.json";
import { useCase } from "@/lib/case-context";
import type { Suspect } from "@/lib/types/case";

// dummy data: location, dialogue
// will make a 'game engine' to random select SUSPECT, WEAPON, MOTIVE, LOCATION. A react hook? To pass game data into AI & this page

const SUSPECT_LAYOUT = [
  "left-[22%] bottom-0 h-[min(68%,480px)] w-[min(24%,300px)] -translate-x-1/2",
  "left-1/2 bottom-0 h-[min(68%,480px)] w-[min(24%,300px)] -translate-x-1/2",
  "left-[78%] bottom-0 h-[min(68%,480px)] w-[min(24%,300px)] -translate-x-1/2",
] as const;

export default function GamePage() {
  const router = useRouter();
  // caseData will be used to dynamically render SUSPECT and Answers
  const { caseData, story, caseId, actionsRemaining, resetActions } = useCase();
  const storyText = story ?? caseContent.story;
  const isOutOfActions = actionsRemaining <= 0;

  useEffect(() => {
    if (story === null) {
      router.replace("/");
    }
  }, [story, router]);

  const suspects: Suspect[] =
    caseData?.suspects.map((row) => row.suspect) ?? (gameData.suspects as Suspect[]);
  const [selectedSuspectId, setSelectedSuspectId] = useState<number | null>(null);

  const selectedSuspect =
    selectedSuspectId === null ? null : suspects.find((s) => s.id === selectedSuspectId) ?? null;

  const [selectedAccusation, setSelectedAccusation] = useState<string | null>(null);

  const [verdict, setVerdict] = useState<null | { status: "win" | "lose"; message: string }>(null);
  const [showVerdictActions, setShowVerdictActions] = useState(false);

  const [isIntroDialogOpen, setIsIntroDialogOpen] = useState(true);
  const [isSolveDialogOpen, setIsSolveDialogOpen] = useState(false);

  function handleAccusation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedAccusation || !caseData) return;

    const isCorrect = Number(selectedAccusation) === caseData.murdererId;

    const murderer = caseData.suspects.find(
      (entry) => entry.suspect.id === caseData.murdererId
    );
    setVerdict({
      status: isCorrect ? "win" : "lose",
      message: isCorrect
        ? "Correct \n The killer confesses under your glare."
        : `Wrong suspect... \n The true murderer was ${murderer?.suspect.name || "unknown"}.`,
    });
    setShowVerdictActions(false);
    setIsSolveDialogOpen(false);
    setTimeout(() => setShowVerdictActions(true), 1500);
  }
  const selectedSuspectIndex =
    selectedSuspectId === null ? -1 : suspects.findIndex((s) => s.id === selectedSuspectId);

  if (story === null) {
    return null;
  }

  const locationBgSrc = caseData?.location.image ?? "/location-bg/office.jpg";

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-3 py-6 sm:px-4">
      <div className="retro text-xs">
        Actions left: {actionsRemaining}/10
        {isOutOfActions && (
          <p className="retro text-xs text-destructive">No actions left — make your accusation.</p>
        )}
      </div>
      <div className="w-full max-w-6xl bg-background">
        <div className="relative w-full">
          <div className="border-4 border-double border-sky-600 bg-sky-950/5 p-1 dark:bg-sky-950/20">
            <div className="relative aspect-video w-full overflow-hidden border-4 border-sky-700">
              <Image
                src={locationBgSrc}
                alt={caseData?.location.name ?? ""}
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
                      "group absolute flex flex-col items-center gap-2 cursor-pointer bg-transparent p-0 text-center",
                      SUSPECT_LAYOUT[i]
                    )}
                  >
                    {/* TODO make name center on top of images */}
                    <span className="retro rounded bg-black/70 px-3 py-1 text-[10px] uppercase text-white shadow">
                      {s.name}
                    </span>
                    <div className="relative h-full w-full">
                      <Image
                        src={s.image}
                        alt=""
                        fill
                        sizes="(max-width: 896px) 24vw, 300px"
                        className="object-contain object-bottom pixelated transition duration-150 ease-out group-hover:scale-[1.05] group-hover:brightness-110 group-hover:drop-shadow-md group-hover:-translate-y-0.5 group-active:scale-[0.98]"
                      />
                    </div>
                  </button>
                ))
              ) : (
                <div className="absolute inset-0 z-10 flex h-full w-full flex-row">
                  <div className="relative flex h-full min-h-0 flex-1 items-end justify-center">
                    <div className="relative mb-0 h-[min(68%,480px)] w-[min(42%,280px)]">
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
                      className="group flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-sm bg-transparent transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-200"
                    >
                      <Image
                        src="/arrow.png"
                        alt=""
                        width={32}
                        height={32}
                        className="h-auto w-auto pixelated transition duration-150 ease-out group-hover:scale-110 group-hover:brightness-110 group-hover:drop-shadow-md group-active:scale-95"
                      />
                    </button>
                    <InterrogationChat
                      key={selectedSuspectId!}
                      caseId={caseId}
                      suspectId={String(selectedSuspect.id)}
                      suspectIndex={selectedSuspectIndex}
                      suspectName={selectedSuspect.name}
                      caseData={caseData}
                      story={story}
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
                  Case story
                </DialogDescription>
              </DialogHeader>
              <p className="retro text-muted-foreground whitespace-pre-line text-[10px] leading-relaxed">
                {storyText}
              </p>
              <DialogClose asChild>
                <Button variant="secondary" className="mt-2 w-full">
                  Close
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="lg" className="min-w-[10rem] px-6 py-5 text-sm">
            Access Noir
          </Button>
          <Dialog open={isSolveDialogOpen} onOpenChange={setIsSolveDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="min-w-[10rem] px-6 py-5 text-sm bg-chart-1">
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
                onSubmit={handleAccusation}
              >
                <label htmlFor="accusation" className="retro text-[10px]">
                  Who is the murderer?
                </label>
                <Select onValueChange={setSelectedAccusation}>
                  <SelectTrigger id="accusation">
                    <SelectValue placeholder="Choose a suspect…" />
                  </SelectTrigger>
                  <SelectContent>
                    {suspects.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" variant="default" className="w-full">
                  Submit accusation
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {verdict && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div
                  role="dialog"
                  aria-modal="true"
                  className={cn(
                    "retro w-full max-w-md rounded border-2 px-6 py-5 text-sm leading-relaxed shadow-2xl",
                    verdict.status === "win"
                      ? "border-emerald-500 bg-emerald-900/90 text-emerald-50"
                      : "border-red-500 bg-red-900/90 text-red-50"
                  )}
                >
                  <p className="text-xs uppercase tracking-[0.3em] mb-2 text-center">
                    {verdict.status === "win" ? "Case Closed" : "Case Failed"}
                  </p>
                  <div className="space-y-2 text-center">
                    {verdict.message.split("\n").map((line) => (
                      <p key={line}>{line.trim()}</p>
                    ))}
                  </div>
                  {!showVerdictActions && (
                    <p className="mt-3 text-[10px] text-emerald-200 animate-pulse">
                      Clearing the scene...
                    </p>
                  )}
                  {showVerdictActions && (
                    <div className="mt-4 flex flex-col gap-6">
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => {
                          resetActions();
                          router.push("/file");
                        }}
                      >
                        Accept new case
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => {
                          resetActions();
                          router.push("/")
                        }}
                      >
                        Leave the scene
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          )}

          <Dialog open={isIntroDialogOpen} onOpenChange={setIsIntroDialogOpen}>
            <DialogContent className="backdrop-blur-sm bg-black/70 text-white">
              <DialogHeader>
                <DialogTitle>Limited Actions</DialogTitle>
                <DialogDescription className="sr-only">
                  Tutorial about action economy
                </DialogDescription>
              </DialogHeader>
              <p className="retro text-sm leading-relaxed">
                You only have 10 actions to solve this case. Every interrogation question spends 1.
                Use them wisely before making your accusation.
              </p>
              <Button className="mt-4 w-full bg-emerald-500 text-emerald-950 hover:bg-emerald-400" onClick={() => setIsIntroDialogOpen(false)}>
                Got it
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
