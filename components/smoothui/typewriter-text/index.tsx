import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

function useReducedMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
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
  /** Fires when the current string has finished typing (also when reduced motion or empty). Not called again until `children` changes and completes again. */
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
  const onCompleteRef = useRef(onComplete);
  useLayoutEffect(() => {
    onCompleteRef.current = onComplete;
  });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayed(children);
      onCompleteRef.current?.();
      return;
    }

    if (children.length === 0) {
      setDisplayed("");
      onCompleteRef.current?.();
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
        onCompleteRef.current?.();
      }
    }
    type();
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [children, speed, loop, shouldReduceMotion]);

  return <span className={className}>{displayed}</span>;
};

export default TypewriterText;
