"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/8bit/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import TypewriterText from "@/components/smoothui/typewriter-text";

import caseContent from "@/data/case-file.json";

export default function File() {
  const title = caseContent.title;
  const description = caseContent.description;
  const storyTitle = caseContent.storyBadge;
  const storyDescription = caseContent.story;
  const instructionTitle = caseContent.instructionBadge;
  const instructionDescription = caseContent.howToPlay;

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

        <div className="grid gap-x-4 gap-y-1 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <Badge variant="destructive">{storyTitle}</Badge>
            </CardHeader>
            <CardContent>
              <TypewriterText
                className="text-muted-foreground retro whitespace-pre-line text-[15px] leading-relaxed"
                speed={30}
              >
                {storyDescription}
              </TypewriterText>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader className="pb-2">
              <Badge>{instructionTitle}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground retro text-[15px] leading-relaxed">
                {instructionDescription}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            asChild
            size="lg"
            className="px-10 py-7 text-lg font-semibold"
          >
            <Link href="/game">Start interrogating</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
