"use client";

import { useEffect, useRef, useState } from "react";

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface Options {
  /** Fraction of the element that must be visible before revealing. */
  threshold?: number;
  /** Root margin passed to the IntersectionObserver. */
  rootMargin?: string;
  /** Reveal only the first time the element enters the viewport. */
  once?: boolean;
}

/**
 * Standard IntersectionObserver wrapper used to drive fade / translate entries.
 * Returns a ref to attach to the target and a boolean that flips to `true`
 * once the element has scrolled into view.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  once = true,
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}

export function getRevealOffset(direction: RevealDirection): string {
  switch (direction) {
    case "up":
      return "translate3d(0, 40px, 0)";
    case "down":
      return "translate3d(0, -40px, 0)";
    case "left":
      return "translate3d(40px, 0, 0)";
    case "right":
      return "translate3d(-40px, 0, 0)";
    default:
      return "translate3d(0, 0, 0)";
  }
}
