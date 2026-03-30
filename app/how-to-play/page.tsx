"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { TutorialSubtitleTypewriter } from "@/components/tutorial-subtitle-typewriter";
import { Button } from "@/components/ui/8bit/button";

import caseContent from "@/data/case-file.json";

const ARROW_IMG = 48;
const ARROW_BTN = "h-14 w-14 min-h-[3.5rem] min-w-[3.5rem]";

export default function HowToPlayPage() {
  const [step, setStep] = useState<1 | 2>(1);

  const imageSrc = step === 1 ? "/crime-scene.png" : "/detective-smoking.png";
  const imageAlt = step === 1 ? "Crime scene" : "Detective";

  const lines = step === 1 ? caseContent.howToPlaySlide1 : caseContent.howToPlaySlide2;

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-3 py-6 sm:px-4">
      <div className="w-full max-w-6xl bg-background">
        <div className="relative w-full">
          <div className="border-4 border-double border-sky-600 bg-sky-950/5 p-1 dark:bg-sky-950/20">
            <div className="relative aspect-video w-full overflow-hidden border-4 border-sky-700">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover pixelated"
                priority
                sizes="(max-width: 896px) 100vw, 896px"
              />
              <div className="absolute inset-x-0 bottom-0 z-10 bg-black/70 px-3 py-3 sm:px-5 sm:py-4">
                <TutorialSubtitleTypewriter
                  key={step}
                  lines={lines}
                  speed={28}
                  pauseBetweenLinesMs={420}
                  className="retro text-[10px] leading-relaxed text-white sm:text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div className="mt-5 flex w-full justify-end">
            <button
              type="button"
              aria-label="Next"
              onClick={() => setStep(2)}
              className={`group flex ${ARROW_BTN} shrink-0 cursor-pointer items-center justify-center rounded-sm bg-transparent transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
            >
              <Image
                src="/flip-arrow.png"
                alt=""
                width={ARROW_IMG}
                height={ARROW_IMG}
                className="h-auto w-auto max-h-[48px] max-w-[48px] pixelated transition duration-150 ease-out group-hover:scale-110 group-hover:brightness-110 group-hover:drop-shadow-md group-active:scale-95"
              />
            </button>
          </div>
        ) : (
          <div className="mt-5 flex w-full flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              aria-label="Back"
              onClick={() => setStep(1)}
              className={`group flex ${ARROW_BTN} shrink-0 cursor-pointer items-center justify-center rounded-sm bg-transparent transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
            >
              <Image
                src="/arrow.png"
                alt=""
                width={ARROW_IMG}
                height={ARROW_IMG}
                className="h-auto w-auto max-h-[48px] max-w-[48px] pixelated transition duration-150 ease-out group-hover:scale-110 group-hover:brightness-110 group-hover:drop-shadow-md group-active:scale-95"
              />
            </button>
            <Button
              asChild
              size="lg"
              className="min-w-[12rem] px-6 py-5 text-sm bg-chart-1"
            >
              <Link href="/file">Open case file</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
