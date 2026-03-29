"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/8bit/button";
import { Spinner } from "@/components/ui/8bit/spinner";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import TypewriterText from "@/components/smoothui/typewriter-text";

import caseContent from "@/data/case-file.json";
import { StoryPayload } from "@/lib/types/case";
import { useCase } from "@/lib/case-context";

export default function File() {
  const { setCaseData, setStory, setCaseId, story } = useCase();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function refreshStory() {
      try {
        const res = await fetch("/api/story", { method: "POST" });
        const data: StoryPayload & { error?: string } = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to load story");
        }
        setCaseData(data.caseData);
        setStory(data.story);
        setCaseId(data.caseId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown story error";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    refreshStory();
  }, [setCaseData, setStory, setCaseId]);

  const title = caseContent.title;
  const description = caseContent.description;
  const storyTitle = caseContent.storyBadge;

  return (
    <section className={cn("w-full px-4 py-16")}>
      <div className="mx-auto w-full max-w-7xl">
        {(title || description) && (
          <div className="mb-10 text-center">
            {title && (
              <h2 className="retro mb-3 font-bold text-2xl tracking-tight md:text-3xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="retro text-muted-foreground text-[9px]">{description}</p>
            )}
          </div>
        )}

        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader className="pb-2">
              <Badge variant="destructive">{storyTitle}</Badge>
            </CardHeader>
            <CardContent>
            {loading ? (
              <div
                className="flex min-h-[4rem] items-center justify-center gap-2 text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <Spinner variant="diamond" className="size-6 text-chart-1" />
                <span className="retro text-sm text-chart-1">Loading story…</span>
              </div>
            ) : error ? (
              <p className="retro text-sm text-destructive">{error}</p>
            ) : (
              <TypewriterText
                className="text-muted-foreground retro whitespace-pre-line text-[15px] leading-relaxed"
                speed={30}
              >
                {story ?? caseContent.story}
              </TypewriterText>
            )}
          </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            asChild
            size="lg"
            className="py-6 text-lg font-semibold bg-chart-1"
          >
            <Link href="/game">Start interrogating</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
