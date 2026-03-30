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
import type { Suspect, EvidenceBundle } from "@/lib/types/case";

// dummy data: location, dialogue
// will make a 'game engine' to random select SUSPECT, WEAPON, MOTIVE, LOCATION. A react hook? To pass game data into AI & this page

const SUSPECT_LAYOUT = [
  "left-[22%] bottom-0 h-[min(68%,480px)] w-[min(24%,300px)] -translate-x-1/2",
  "left-1/2 bottom-0 h-[min(68%,480px)] w-[min(24%,300px)] -translate-x-1/2",
  "left-[78%] bottom-0 h-[min(68%,480px)] w-[min(24%,300px)] -translate-x-1/2",
] as const;

const terminalActions: Record<string, { label: string; evidenceKey: keyof EvidenceBundle }> = {
  "1": { label: "Check Security Footage", evidenceKey: "securityFootage" },
  "2": { label: "Analyse Weapon", evidenceKey: "weaponAnalysis" },
  "3": { label: "View Bystander Statements", evidenceKey: "bystanderStatements" },
  "4": { label: "Access Digital Records", evidenceKey: "digitalRecords" },
};


export default function GamePage() {
  const router = useRouter();
  // caseData will be used to dynamically render SUSPECT and Answers
  const { caseData, story, caseId, actionsRemaining, resetActions, evidenceBundle, decrementAction } = useCase();
  const storyText = story ?? caseContent.story;

  const actionTint = actionsRemaining > 6
  ? "text-emerald-600 hover:text-emerald-600"
  : actionsRemaining > 3
    ? "text-amber-500 hover:text-amber-500"
    : actionsRemaining > 0
      ? "text-red-500 hover:text-red-500"
      : "text-red-700 hover:text-red-700";

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

  const [terminalInput, setTerminalInput] = useState(""); 
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalLog, setTerminalLog] = useState<string[]>([]);
  const [usedTerminalActions, setUsedTerminalActions] = useState<Record<string, boolean>>({});

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

  async function handleTerminalInput(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const command = terminalInput.trim();
    setTerminalInput("");
    setTerminalLog(prev => [...prev, `> ${command}`]);
    
    if (usedTerminalActions[command]) {
      setTerminalLog(prev => [...prev, "Command already spent. Choose another."]);
      return;
    }

    if (actionsRemaining <= 0) {
      setTerminalLog(prev => [...prev, "No actions left. Make your accusation."]);
      return;
    }

    const action = terminalActions[command];
    if (!action) {
      setTerminalLog(prev => [...prev, "Invalid command. Enter 1-5."]);
      return;
    }
    if (!caseData || !story) {
      setTerminalLog(prev => [...prev, "Case data unavailable. Retry once case loads."]);
      return;
    }

    setTerminalLog(prev => [...prev, "Processing..."]);

    if (!evidenceBundle) {
      setTerminalLog(prev => [...prev, "Evidence loading. Try again."]);
      return;
    }
    const evidenceText = evidenceBundle[action.evidenceKey];
    const noirBlock = [
      `*** NOIR/PD-OS :: ${action.label} ***`,
      "REPORT:",
      ...evidenceText.map(line => `-- ${line.trim()}`),
      "STATUS: READY",
    ].join("\n");
    setTerminalLog(prev => [...prev.slice(0, -1), noirBlock]);
    setUsedTerminalActions(prev => ({ ...prev, [command]: true }));
    decrementAction();
  }

  const selectedSuspectIndex =
    selectedSuspectId === null ? -1 : suspects.findIndex((s) => s.id === selectedSuspectId);

  if (story === null) {
    return null;
  }

  const locationBgSrc = caseData?.location.image ?? "/location-bg/office.jpg";

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-3 py-6 sm:px-4">
      <div className="flex justify-between w-full max-w-6xl mb-4 items-baseline">
        <Dialog open={isIntroDialogOpen} onOpenChange={setIsIntroDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="min-w-[10rem] px-6 py-5 text-sm bg-zinc-200 hover:bg-zinc-300 text-emerald-600 hover:text-emerald-600">
              Instructions
            </Button>
          </DialogTrigger>
          <DialogContent className="backdrop-blur-sm bg-black/70 text-white max-w-none sm:max-w-[900px] w-[95vw]">
            <DialogHeader>
              <DialogTitle className="text-center">Instructions</DialogTitle>
              <DialogDescription className="sr-only">
                Tutorial about action economy
              </DialogDescription>
            </DialogHeader>
            <ul className="grid gap-3 text-xs text-emerald-100">
              <li className="bg-black/30 border border-emerald-400/40 rounded px-3 py-2">
                <p className="font-semibold tracking-[0.2em] text-[12px] text-emerald-300 mb-2">
                  GOAL
                </p>
                <p>Identify the killer before your actions run out.</p>
              </li>
              <li className="bg-black/30 border border-emerald-400/40 rounded px-3 py-2">
                <p className="font-semibold tracking-[0.2em] text-[12px] text-emerald-300 mb-2">
                  INTERACTION 1: INTERROGATION
                </p>
                <p>Click on each suspect to interrogate them and pay attention to their responses. Each question asked will consume 1 action.</p>
              </li>
              <li className="bg-black/30 border border-emerald-400/40 rounded px-3 py-2">
                <p className="font-semibold tracking-[0.2em] text-[12px] text-emerald-300 mb-2">
                  INTERACTION 2: NOIR TERMINAL
                </p>
                <p>Use the Noir database to retrieve key evidence and info. Each tool can be used only once and marks itself when spent.</p>
              </li>
              <li className="bg-black/30 border border-emerald-400/40 rounded px-3 py-2">
                <p className="font-semibold tracking-[0.2em] text-[12px] text-emerald-300 mb-2">
                  FINAL MOVE
                </p>
                <p>You only have <strong>10</strong> actions. When you run out of actions, make your accusation!</p>
              </li>
            </ul>
            <Button className="mt-4 w-full bg-emerald-500 text-emerald-950 hover:bg-emerald-400" onClick={() => setIsIntroDialogOpen(false)}>
              Got it
            </Button>
          </DialogContent>
        </Dialog>
        <div className="retro text-xs ">
          {actionsRemaining > 0 ? (
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "min-w-[10rem] px-6 py-5 text-sm bg-zinc-200 hover:bg-zinc-200 border",
                actionTint,
                actionTint.includes("red") && "border-red-400",
                actionTint.includes("amber") && "border-amber-400",
                actionTint.includes("emerald") && "border-emerald-400"
              )}
            >
              Actions left: {actionsRemaining}/10
            </Button>
          ) : (
            <p className="retro text-xs text-red-700">
              No actions left — make your accusation.
            </p>
          )}
        </div>
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
              <Button variant="outline" size="lg" className="min-w-[10rem] px-6 py-5 text-sm bg-orange-200 hover:bg-orange-300">
                Access case file
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-orange-200">
              <DialogHeader>
                <DialogTitle className="">Case file</DialogTitle>
                <DialogDescription className="sr-only">
                  Case story
                </DialogDescription>
              </DialogHeader>
              <p className="retro whitespace-pre-line text-[10px] leading-relaxed">
                {storyText}
              </p>
              <DialogClose asChild>
                <Button variant="secondary" className="mt-2 w-full bg-red-500 text-red-50 hover:bg-red-400">
                  Close
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>

          <Dialog open={isTerminalOpen} onOpenChange={setIsTerminalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="min-w-[10rem] px-6 py-5 text-sm bg-black text-green-400 hover:bg-green-400 hover:text-black">
                Access Noir
              </Button>
            </DialogTrigger>
            <DialogContent 
              decorativeFrame={false}
              className="bg-black text-green-200 font-mono sm:max-w-[900px] w-[95vw] max-w-none max-h-[80vh] overflow-y-auto overflow-x-hidden noir-scrollbar"
            >
              <DialogHeader>
                <DialogTitle>Noir - Database Terminal</DialogTitle>
              </DialogHeader>
              <div className="w-full p-4 space-y-4">
              <header>
                <p className="text-xs text-green-400">Type a number (1-4) and press Enter</p>
              </header>
              <ul className="space-y-1 text-sm">
                {Object.entries(terminalActions).map(([key, action]) => (
                  <li
                    key={key}
                    className={cn(
                      "transition text-sm",
                      usedTerminalActions[key] && "line-through text-green-900/60"
                    )}
                  >
                    {key} - {action.label}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-xs space-y-1 font-mono">
                {terminalLog.map((entry, idx) => (
                  <p key={`${entry}-${idx}`} className="whitespace-pre-wrap">
                    {entry}
                  </p>
                ))}
              </div>
              <form onSubmit={handleTerminalInput} className="flex items-center gap-2">
                <span>&gt;</span>
                <input
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  className="flex-1 bg-transparent border-b border-green-500 focus:outline-none"
                  autoFocus
                />
              </form>
            </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSolveDialogOpen} onOpenChange={setIsSolveDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="min-w-[10rem] px-6 py-5 text-sm bg-chart-1 hover:bg-red-700">
                Solve the case
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center">Solve the case</DialogTitle>
                <DialogDescription className="sr-only">
                  Choose a suspect to accuse
                </DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-4"
                onSubmit={handleAccusation}
              >
                <label htmlFor="accusation" className="retro text-[10px] text-center">
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
                    <p className="mt-3 text-[10px] text-emerald-200 animate-pulse text-center">
                      Clearing the scene...
                    </p>
                  )}
                  {showVerdictActions && (
                    <div className="mt-4 flex flex-col gap-6">
                      <Button
                        variant="default"
                        className="w-full bg-black text-emerald-500 hover:bg-emerald-400 hover:text-black"
                        onClick={() => {
                          resetActions();
                          router.push("/file");
                        }}
                      >
                        Accept new case
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full bg-black text-red-500 hover:bg-red-400 hover:text-black"
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
        </div>
      </div>
    </div>
  );
}
