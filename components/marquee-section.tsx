"use client";

import { useEffect, useRef } from "react";

const PHRASES = ["Assume breach.", "Trust nothing.", "Verify everything."];

/**
 * Infinite manifesto banner. Three copies of the phrase list drift left by
 * default; the drift speeds up with scroll velocity and flips direction when
 * the reader scrolls up, so the band physically responds to the page. It never
 * pauses on hover. Position is driven straight onto the node in a rAF loop (no
 * scroll listener, no React state), the loop only runs while the band is on
 * screen, and it collapses to a static strip under `prefers-reduced-motion`.
 */
export function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const BASE = 0.4; // px per frame idle drift
    let raf = 0;
    let inView = true;
    let x = -track.scrollWidth / 6; // start mid-copy for runway both ways
    let lastY = window.scrollY;
    let boost = 0;
    let dir = -1; // -1 drifts left, +1 drifts right
    let skew = 0;

    const copyWidth = () => track.scrollWidth / 3;

    const tick = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;

      if (Math.abs(dy) > 0.5) {
        dir = dy > 0 ? -1 : 1;
      } else {
        dir += (-1 - dir) * 0.02; // ease back to leftward when idle
      }

      const targetBoost = Math.min(Math.abs(dy) * 0.35, 14);
      boost += (targetBoost - boost) * 0.15;
      boost *= 0.92;

      const targetSkew = Math.max(-1.5, Math.min(1.5, -dy * 0.05));
      skew += (targetSkew - skew) * 0.1;
      skew *= 0.9;

      x += dir * (BASE + boost);
      const w = copyWidth();
      if (x <= -w) x += w;
      else if (x > 0) x -= w;

      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(
        2,
      )}deg)`;

      raf = inView ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !raf) raf = requestAnimationFrame(tick);
      },
      { threshold: 0 },
    );
    io.observe(section);

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const track = [...PHRASES, ...PHRASES, ...PHRASES];

  return (
    <section
      ref={sectionRef}
      aria-label="Security principles"
      className="dark-block overflow-hidden border-y py-7"
    >
      <ul
        ref={trackRef}
        className="flex w-max items-center gap-14 whitespace-nowrap font-display text-2xl font-medium will-change-transform md:text-3xl"
      >
        {track.map((phrase, i) => (
          <li key={`${phrase}-${i}`} className="flex items-center gap-14">
            <span>{phrase}</span>
            <span aria-hidden className="text-accent">
              /
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
