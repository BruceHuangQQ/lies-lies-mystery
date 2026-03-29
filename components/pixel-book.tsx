"use client";

import Image from "next/image";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import TypewriterText from "@/components/smoothui/typewriter-text";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Intrinsic size of public/paper.png */
const BOOK_SRC = "/paper.png";
const BOOK_ASPECT = 1600 / 1324;

type PageInsets = {
  pageTop: string;
  pageHeight: string;
  leftPageLeft: string;
  rightPageLeft: string;
  pageWidth: string;
};

const DEFAULT_INSETS: PageInsets = {
  pageTop: "10%",
  pageHeight: "78%",
  leftPageLeft: "4.5%",
  rightPageLeft: "53.5%",
  pageWidth: "42%",
};

function pageBoxStyle(side: "left" | "right", insets: PageInsets): CSSProperties {
  return {
    top: insets.pageTop,
    height: insets.pageHeight,
    width: insets.pageWidth,
    left: side === "left" ? insets.leftPageLeft : insets.rightPageLeft,
  };
}

function fitsInBox(
  text: string,
  box: HTMLElement,
  paragraph: HTMLElement,
): boolean {
  paragraph.textContent = text;
  return paragraph.scrollHeight <= box.clientHeight + 0.5;
}

/** Largest prefix length such that full.slice(0, len) fits in the box. */
function maxPrefixLength(
  full: string,
  box: HTMLElement,
  paragraph: HTMLElement,
): number {
  let lo = 0;
  let hi = full.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (fitsInBox(full.slice(0, mid), box, paragraph)) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Prefer breaking at a space slightly before the greedy cut. */
function refineCutAtWord(
  full: string,
  cut: number,
  box: HTMLElement,
  paragraph: HTMLElement,
): number {
  if (cut <= 0 || cut >= full.length) return cut;
  let s = full.lastIndexOf(" ", cut - 1);
  while (s > 0) {
    if (fitsInBox(full.slice(0, s), box, paragraph)) return s;
    s = full.lastIndexOf(" ", s - 1);
  }
  return cut;
}

function PixelBookVisibleLayers({
  leftPage,
  rightPage,
  typewriterSpeed,
  textClass,
  badge,
  insets,
  pageStyle,
}: {
  leftPage: string;
  rightPage: string;
  typewriterSpeed: number;
  textClass: string;
  badge: ReactNode | undefined;
  insets: PageInsets;
  pageStyle: (side: "left" | "right") => string;
}) {
  const [leftTyped, setLeftTyped] = useState(() => leftPage.length === 0);

  return (
    <>
      {badge != null ? (
        <div
          className={cn(
            "page absolute left-page flex flex-col gap-2 overflow-hidden text-left pt-4",
          )}
          style={pageBoxStyle("left", insets)}
        >
          <div className="shrink-0 px-[4%] pt-[3%]">{badge}</div>
          <div className="min-h-0 flex-1 overflow-hidden px-[4%] pb-[3%]">
            <p className={textClass}>
              <TypewriterText
                speed={typewriterSpeed}
                className="text-inherit"
                onComplete={() => setLeftTyped(true)}
              >
                {leftPage}
              </TypewriterText>
            </p>
          </div>
        </div>
      ) : (
        <div
          className={cn(pageStyle("left"), "text-left")}
          style={pageBoxStyle("left", insets)}
        >
          <p className={textClass}>
            <TypewriterText
              speed={typewriterSpeed}
              className="text-inherit"
              onComplete={() => setLeftTyped(true)}
            >
              {leftPage}
            </TypewriterText>
          </p>
        </div>
      )}
      <div
        className={cn(pageStyle("right"), "text-left")}
        style={pageBoxStyle("right", insets)}
      >
        <p className={textClass}>
          {rightPage ? (
            <TypewriterText speed={typewriterSpeed} className="text-inherit">
              {leftTyped ? rightPage : ""}
            </TypewriterText>
          ) : null}
        </p>
      </div>
    </>
  );
}

export type PixelBookProps = {
  text?: string;
  /** Label for the default-style badge on the left page; not included in height pagination. */
  badgeLabel?: string;
  className?: string;
  /** Tune overlay boxes to match the dashed frame in paper.png */
  insets?: Partial<PageInsets>;
  /** Milliseconds per character for visible page text. */
  typewriterSpeed?: number;
};

export function PixelBook({
  text = "",
  badgeLabel,
  className,
  insets: insetsProp,
  typewriterSpeed = 20,
}: PixelBookProps) {
  const badge =
    badgeLabel != null && badgeLabel !== "" ? (
      <Badge>{badgeLabel}</Badge>
    ) : undefined;
  const insets = { ...DEFAULT_INSETS, ...insetsProp };
  const bookRef = useRef<HTMLDivElement>(null);
  const measureLeftBoxRef = useRef<HTMLDivElement>(null);
  const measureLeftTextRef = useRef<HTMLParagraphElement>(null);
  const measureRightBoxRef = useRef<HTMLDivElement>(null);
  const measureRightTextRef = useRef<HTMLParagraphElement>(null);

  const [leftPage, setLeftPage] = useState("");
  const [rightPage, setRightPage] = useState("");

  const textClass =
    "retro m-0 whitespace-pre-wrap break-words text-[9px] leading-relaxed text-[#3d2914] sm:text-[10px] md:text-[11px]";

  const layout = useCallback(() => {
    const full = (text ?? "").trim();
    const lb = measureLeftBoxRef.current;
    const lp = measureLeftTextRef.current;
    const rb = measureRightBoxRef.current;
    const rp = measureRightTextRef.current;
    if (!lb || !lp || !rb || !rp) {
      setLeftPage(full);
      setRightPage("");
      return;
    }

    if (!full) {
      setLeftPage("");
      setRightPage("");
      return;
    }

    let leftCut = maxPrefixLength(full, lb, lp);
    leftCut = refineCutAtWord(full, leftCut, lb, lp);

    const left = full.slice(0, leftCut).trimEnd();
    const rest = full.slice(leftCut).trimStart();

    let right = "";
    if (rest) {
      let rightCut = maxPrefixLength(rest, rb, rp);
      rightCut = refineCutAtWord(rest, rightCut, rb, rp);
      right = rest.slice(0, rightCut).trimEnd();
      if (rightCut < rest.length) {
        right = `${right}…`;
      }
    }

    setLeftPage(left);
    setRightPage(right);
  }, [text]);

  useLayoutEffect(() => {
    const el = bookRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    let raf = 0;
    const scheduleLayout = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => layout());
    };

    scheduleLayout();
    const ro = new ResizeObserver(() => scheduleLayout());
    ro.observe(el);

    void document.fonts?.ready?.then(() => scheduleLayout()).catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [layout, badgeLabel]);

  const pageStyle = (side: "left" | "right") =>
    cn(
      "page absolute overflow-hidden px-[4%] py-[3%]",
      side === "left" ? "left-page" : "right-page",
    );

  return (
    <div
      ref={bookRef}
      className={cn(
        "book relative mx-auto w-full max-w-[min(920px,100%)]",
        className,
      )}
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: `${BOOK_ASPECT}` }}
      >
        <Image
          src={BOOK_SRC}
          alt=""
          fill
          className="pixelated object-fill select-none"
          sizes="(max-width: 920px) 100vw, 920px"
          priority
        />

        {/* Hidden measurement layer — same geometry and typography as visible pages */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0"
        >
          {badge != null ? (
            <div
              className={cn(
                "page absolute left-page flex flex-col gap-5 overflow-hidden text-left sm:gap-2",
              )}
              style={pageBoxStyle("left", insets)}
            >
              <div className="shrink-0 px-[4%] pt-[3%] pb-0">{badge}</div>
              <div
                ref={measureLeftBoxRef}
                className="min-h-0 flex-1 overflow-hidden px-[4%] pb-[3%]"
              >
                <p ref={measureLeftTextRef} className={textClass} />
              </div>
            </div>
          ) : (
            <div
              ref={measureLeftBoxRef}
              className={cn(pageStyle("left"), "text-left")}
              style={pageBoxStyle("left", insets)}
            >
              <p ref={measureLeftTextRef} className={textClass} />
            </div>
          )}
          <div
            ref={measureRightBoxRef}
            className={cn(pageStyle("right"), "text-left")}
            style={pageBoxStyle("right", insets)}
          >
            <p ref={measureRightTextRef} className={textClass} />
          </div>
        </div>

        <div
          className="absolute inset-0 z-[1] overflow-hidden"
          aria-live="off"
        >
          <PixelBookVisibleLayers
            key={`${leftPage}\0${rightPage}`}
            leftPage={leftPage}
            rightPage={rightPage}
            typewriterSpeed={typewriterSpeed}
            textClass={textClass}
            badge={badge}
            insets={insets}
            pageStyle={pageStyle}
          />
        </div>
      </div>
    </div>
  );
}
