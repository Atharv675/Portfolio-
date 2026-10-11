"use client";

import { useEffect } from "react";

/**
 * Crossfades the page background between two paper shades as the reader moves
 * between sections, giving the scroll a sense of chapters. Stays inside the
 * warm-paper family (never a tinted theme flip). Section tracking is
 * IntersectionObserver-driven; the fade itself is a CSS transition on <body>
 * (see globals.css), disabled under prefers-reduced-motion.
 */
const TINTS: Record<string, string> = {
  projects: "var(--paper)",
  about: "var(--paper-2)",
  experience: "var(--paper)",
  skills: "var(--paper-2)",
  contact: "var(--paper)",
};

export function SectionTint() {
  useEffect(() => {
    const els = Object.keys(TINTS)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.body.style.backgroundColor =
              TINTS[entry.target.id] ?? "var(--paper)";
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      document.body.style.backgroundColor = "";
    };
  }, []);

  return null;
}
