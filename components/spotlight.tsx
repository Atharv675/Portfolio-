"use client";

import { useEffect, useRef } from "react";

/**
 * A soft warm glow that eases toward the cursor while it is over the parent
 * section. Position is written straight onto the node in a rAF loop (no React
 * state), fades out on leave, and is skipped entirely under
 * prefers-reduced-motion. Drop it as the first child of a `position: relative`
 * section.
 */
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0,
      shown = false;

    const loop = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      el.style.setProperty("--sx", cx.toFixed(1) + "px");
      el.style.setProperty("--sy", cy.toFixed(1) + "px");
      raf =
        Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4
          ? requestAnimationFrame(loop)
          : 0;
    };

    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!shown) {
        shown = true;
        el.style.opacity = "1";
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      shown = false;
      el.style.opacity = "0";
    };

    parent.addEventListener("pointermove", onMove, { passive: true });
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(560px circle at var(--sx, 50%) var(--sy, 30%), rgba(226, 84, 47, 0.07), transparent 66%)",
      }}
    />
  );
}
