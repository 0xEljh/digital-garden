import React, { useEffect, useMemo, useRef, useState } from "react";
import { m } from "motion/react";

interface ScrambleTextProps {
  text: string;
  speedMs?: number;
  maxIterations?: number;
  animateOn?: "mount" | "view";
  characters?: string;
  className?: string;
  startScrambled?: boolean;
  onComplete?: () => void;
}

const DEFAULT_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const ScrambleText = ({
  text,
  speedMs = 24,
  maxIterations = 18,
  animateOn = "mount",
  characters = DEFAULT_CHARS,
  className,
  startScrambled = false,
  onComplete,
}: ScrambleTextProps) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [displayText, setDisplayText] = useState(text);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    setDisplayText(startScrambled ? "" : text);
  }, [startScrambled, text]);

  const availableChars = useMemo(() => characters.split(""), [characters]);

  useEffect(() => {
    if (animateOn === "mount") {
      setHasAnimated(true);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasAnimated(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [animateOn]);

  useEffect(() => {
    if (!hasAnimated) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) => {
        const src = prev.length === text.length ? prev : text;
        const next = (startScrambled ? text : src)
          .split("")
          .map((char, i) => {
            if (text[i] === "\n") return "\n";
            if (text[i] === " ") return " ";
            if (text[i] === "\t") return "\t";
            return availableChars[Math.floor(Math.random() * availableChars.length)];
          })
          .join("");
        return next;
      });

      iteration++;
      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        onComplete?.();
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [availableChars, hasAnimated, maxIterations, onComplete, speedMs, startScrambled, text]);

  return (
    <m.span ref={containerRef} className={className}>
      <span style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
        {text}
      </span>
      <span aria-hidden="true" style={{ whiteSpace: "pre" }}>
        {displayText}
      </span>
    </m.span>
  );
};
