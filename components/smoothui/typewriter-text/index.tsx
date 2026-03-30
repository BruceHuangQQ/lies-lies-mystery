import type React from "react";
import { useEffect, useRef, useState } from "react";

function useReducedMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // some weird react issues - keep as is
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return shouldReduceMotion;
}

export interface TypewriterTextProps {
  children: string;
  speed?: number;
  loop?: boolean;
  className?: string;
  // AI suggested solution - it does an action when line finishes typing
  /** Fires once when typing finishes (not called each loop when `loop` is true). */
  onComplete?: () => void;
}

const LOOP_RESTART_DELAY_MS = 1000;

const TypewriterText: React.FC<TypewriterTextProps> = ({
  children,
  speed = 50,
  loop = false,
  className = "",
  onComplete,
}) => {
  const [displayed, setDisplayed] = useState("");
  const index = useRef(0);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      // Show full text immediately when reduced motion is enabled
      setDisplayed(children);
      onComplete?.();
      return;
    }

    setDisplayed("");
    index.current = 0;
    function type() {
      setDisplayed(children.slice(0, index.current + 1));
      if (index.current < children.length - 1) {
        index.current++;
        timeout.current = setTimeout(type, speed);
      } else if (loop) {
        timeout.current = setTimeout(() => {
          setDisplayed("");
          index.current = 0;
          type();
        }, LOOP_RESTART_DELAY_MS);
      } else {
        onComplete?.();
      }
    }
    type();
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [children, speed, loop, shouldReduceMotion, onComplete]);

  return <span className={className}>{displayed}</span>;
};

export default TypewriterText;
