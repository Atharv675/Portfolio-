"use client";

import {
  ElementType,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";

interface MagneticProps {
  children: ReactNode;
  /** Pull strength — fraction of the cursor offset the element follows. */
  strength?: number;
  /** Extra travel for the inner content, for a subtle parallax. */
  innerStrength?: number;
  className?: string;
  as?: ElementType;
}

/**
 * Wraps an interactive element so it eases toward the cursor while hovered and
 * springs back on leave. The inner span can travel a little further for depth.
 */
export function Magnetic({
  children,
  strength = 0.35,
  innerStrength = 0.15,
  className,
  as,
}: MagneticProps) {
  const Tag = (as ?? "div") as ElementType;
  const outerRef = useRef<HTMLElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const raf = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const move = useCallback(
    (e: React.MouseEvent) => {
      if (reduced.current) return;
      const el = outerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
        if (innerRef.current) {
          innerRef.current.style.transform = `translate3d(${x * innerStrength}px, ${
            y * innerStrength
          }px, 0)`;
        }
      });
    },
    [strength, innerStrength],
  );

  const reset = useCallback(() => {
    const el = outerRef.current;
    if (el) el.style.transform = "translate3d(0,0,0)";
    if (innerRef.current) innerRef.current.style.transform = "translate3d(0,0,0)";
  }, []);

  return (
    <Tag
      ref={outerRef as React.Ref<HTMLElement>}
      onMouseMove={move}
      onMouseLeave={reset}
      className={className}
      style={{ transition: "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <span
        ref={innerRef}
        className="block"
        style={{ transition: "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {children}
      </span>
    </Tag>
  );
}
