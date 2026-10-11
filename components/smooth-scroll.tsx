"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

let instance: Lenis | null = null;

/** The live Lenis instance while smooth scroll is active, else null. */
export function getLenis(): Lenis | null {
  return instance;
}

/**
 * Programmatic scroll that routes through Lenis when it is running and falls
 * back to native behaviour otherwise (reduced motion, touch, pre-hydration).
 */
export function smoothScrollTo(
  target: number | string | HTMLElement,
  offset = 0,
) {
  if (target === "#hero" || target === "#top") {
    target = 0;
  }

  if (instance) {
    instance.scrollTo(target, { offset });
    return;
  }

  if (typeof window === "undefined") return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = reduced ? "auto" : "smooth";

  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior });
    return;
  }

  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior });
}

/**
 * Site-wide smooth inertia scrolling powered by Lenis.
 * Eases wheel scrolling on desktop, synchronises touch momentum,
 * automatically handles anchor links, and resizes dynamically.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.08,
      touchInertiaExponent: 1.6,
      autoRaf: true,
      anchors: true,
      autoResize: true,
      overscroll: true,
    });
    instance = lenis;

    // Expose lenis globally for debugging and external controls
    if (typeof window !== "undefined") {
      (window as unknown as { lenis: Lenis }).lenis = lenis;
    }

    // Intercept all internal anchor link clicks to ensure Lenis smooth scroll executes everywhere
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      // Skip non-navigational or empty targets
      if (href === "#") {
        e.preventDefault();
        lenis.scrollTo(0);
        return;
      }

      if (href === "#hero" || href === "#top") {
        e.preventDefault();
        lenis.scrollTo(0);
        return;
      }

      const targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl as HTMLElement);
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    // Recalculate dimensions when layout or dynamic content changes
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(document.body);

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      resizeObserver.disconnect();
      lenis.destroy();
      instance = null;
      if (typeof window !== "undefined") {
        delete (window as unknown as { lenis?: Lenis }).lenis;
      }
    };
  }, []);

  return <>{children}</>;
}
