import Link from "next/link";

import { Button } from "@/components/ui/8bit/button";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <main className="flex max-w-4xl flex-col items-center gap-10 text-center">
        <div className="flex flex-col gap-3">
          {/* <p className="font-mono text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
            A web mystery
          </p> */}
          <h1 className="mb-7 text-5xl font-mono font-bold tracking-tight text-balance sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="block">LLM</span>
            <span className="mt-2 block text-3xl font-semibold tracking-tight text-muted-foreground sm:text-4xl md:text-5xl lg:text-4xl">
              Lies, Lies, Mystery
            </span>
          </h1>
        </div>

        <Button
          asChild
          size="lg"
          className="h-15 min-w-[200px] px-10 text-xl font-semibold"
        >
          <Link href="/empty">Start game</Link>
        </Button>
      </main>
    </div>
  );
}
