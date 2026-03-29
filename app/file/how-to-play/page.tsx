import Link from "next/link";

import { PixelBook } from "@/components/pixel-book";
import { Button } from "@/components/ui/8bit/button";
import { cn } from "@/lib/utils";

import caseContent from "@/data/case-file.json";

export default function HowToPlayPage() {
  const instructionTitle = caseContent.instructionBadge;
  const instructionDescription = caseContent.howToPlay;

  return (
    <section className={cn("w-full px-4 py-16")}>
      <div className="mx-auto w-full max-w-7xl">
        <PixelBook
          badgeLabel={instructionTitle}
          text={instructionDescription}
          className="mb-10"
          insets={{ leftPageLeft: "9%", rightPageLeft: "55%", pageWidth: "40%" }}
        />

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="py-6 text-lg font-semibold bg-chart-1"
          >
            <Link href="/file">I know how to play the game</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
