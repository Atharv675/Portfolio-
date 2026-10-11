"use client";

import { useEffect, useState } from "react";
import { smoothScrollTo } from "@/components/smooth-scroll";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "projects", label: "Selected Work" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

/**
 * Fixed right-edge progress rail (desktop only). Ticks fill as the reader moves
 * down the page, the current section is labelled, and each tick scrolls to its
 * section. Hidden while the hero owns the viewport. Active tracking is
 * IntersectionObserver-driven, so there is no scroll listener.
 */
export function ScrollRail() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.intersectionRatio < 0.35),
      { threshold: [0, 0.35, 1] },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = SECTIONS.findIndex((s) => s.id === entry.target.id);
          if (idx !== -1) setActiveIndex(idx);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (id: string) => {
    if (id === "hero") smoothScrollTo(0);
    else smoothScrollTo(`#${id}`);
  };

  return (
    <nav
      aria-label="Section progress"
      className={`fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 transition-opacity duration-500 lg:flex ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span className="mb-1 font-mono text-[11px] tracking-[0.18em] text-ink-30">
        <span className="text-ink">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>
        {" / "}
        {String(SECTIONS.length).padStart(2, "0")}
      </span>

      {SECTIONS.map((section, i) => {
        const active = i === activeIndex;
        const filled = i <= activeIndex;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => go(section.id)}
            aria-current={active ? "true" : undefined}
            className="group flex items-center gap-2.5 py-1"
          >
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.18em] transition-opacity duration-300 ${
                active
                  ? "text-ink opacity-100"
                  : "text-ink-50 opacity-0 group-hover:opacity-100"
              }`}
            >
              {section.label}
            </span>
            <span
              className={`block transition-all duration-300 group-hover:bg-accent ${
                active
                  ? "h-0.5 w-8 bg-accent"
                  : filled
                    ? "h-px w-5 bg-ink-30"
                    : "h-px w-3 bg-line"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
