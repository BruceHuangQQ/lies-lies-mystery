import Image from "next/image";
import Link from "next/link";
import { LoopTypewriterSubtitle } from "@/components/loop-typewriter-subtitle";
import { GameEngine } from "@/lib/gameEngine";
import { Button } from "@/components/ui/8bit/button";

export default function Home() {
  const engine = new GameEngine();
  engine.generateCase();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <main className="flex w-full max-w-6xl flex-col items-center gap-12 md:flex-row md:items-center md:justify-between md:gap-10 lg:gap-16">
        <div className="flex w-full min-w-0 flex-1 flex-col items-center text-center md:items-start md:text-left">
          <div className="w-full">
            <h1 className="text-5xl font-mono font-bold tracking-tight text-balance sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="block">LLM</span>
              {/* Fixed vertical slot so the typewriter does not shove the button typing*/}
              <div className="min-h-[5rem] sm:min-h-[5.5rem] md:min-h-[6rem] lg:min-h-[5.5rem]">
                <LoopTypewriterSubtitle />
              </div>
            </h1>
          </div>

          <div className="mt-14 flex w-full justify-center md:mt-16 md:justify-start">
            <Button
              asChild
              size="lg"
              className="cursor-pointer h-15 min-w-[200px] px-10 text-xl font-semibold bg-chart-1"
            >
              <Link href="/file/how-to-play">Start game</Link>
            </Button>
          </div>
        </div>

        <div className="relative w-full max-w-[min(100%,420px)] shrink-0 md:max-w-[min(45vw,480px)]">
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src="/detective_running.gif"
              alt=""
              fill
              className="object-contain object-center pixelated"
              unoptimized
              priority
              sizes="(max-width: 768px) min(100vw,420px), 45vw"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
