"use client";

import {
  Children,
  CSSProperties,
  ElementType,
  ReactNode,
  isValidElement,
} from "react";
import {
  getRevealOffset,
  RevealDirection,
  useScrollReveal,
} from "@/hooks/use-scroll-reveal";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
}

/** Fade + translate an element in the first time it enters the viewport. */
export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 800,
  className,
  as,
  style,
}: ScrollRevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate3d(0,0,0)" : getRevealOffset(direction),
        transition: `opacity ${duration}ms ${EASE} ${delay}ms, transform ${duration}ms ${EASE} ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}

interface StaggerProps {
  children: ReactNode;
  /** ms between each child. */
  step?: number;
  /** ms before the first child. */
  base?: number;
  direction?: RevealDirection;
  duration?: number;
  className?: string;
  childClassName?: string;
  as?: ElementType;
}

/**
 * Reveals direct children one after another once the group scrolls into view.
 * Each child is wrapped so no extra markup contract is imposed on callers.
 */
export function Stagger({
  children,
  step = 90,
  base = 0,
  direction = "up",
  duration = 800,
  className,
  childClassName,
  as,
}: StaggerProps) {
  const Tag = (as ?? "div") as ElementType;
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className}>
      {items.map((child, i) => (
        <div
          key={i}
          className={childClassName}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? "translate3d(0,0,0)"
              : getRevealOffset(direction),
            transition: `opacity ${duration}ms ${EASE} ${
              base + i * step
            }ms, transform ${duration}ms ${EASE} ${base + i * step}ms`,
            willChange: "opacity, transform",
          }}
        >
          {child}
        </div>
      ))}
    </Tag>
  );
}

interface WordRevealProps {
  text: string;
  className?: string;
  step?: number;
}

interface LineRevealProps {
  /** Each string is one visual line; rendered as a clip-masked block. */
  lines: string[];
  className?: string;
  as?: ElementType;
  /** ms between each line. */
  step?: number;
  duration?: number;
}

/**
 * Reveals a heading line-by-line with a rising clip mask once it scrolls into
 * view. Give each line its own string; multi-line headings no longer need a
 * literal `<br />`.
 */
export function LineReveal({
  lines,
  className,
  as,
  step = 90,
  duration = 750,
}: LineRevealProps) {
  const Tag = (as ?? "h2") as ElementType;
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.3 });

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={className}
      aria-label={lines.join(" ")}
    >
      {lines.map((line, i) => (
        <span
          key={i}
          aria-hidden
          className="block overflow-hidden pb-[0.14em]"
        >
          <span
            className="block"
            style={{
              transform: isVisible ? "translateY(0%)" : "translateY(108%)",
              opacity: isVisible ? 1 : 0,
              transition: `transform ${duration}ms ${EASE} ${i * step}ms, opacity ${duration}ms ${EASE} ${
                i * step
              }ms`,
              willChange: "transform, opacity",
            }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Reveals a phrase word-by-word with a rising clip mask. */
export function WordReveal({ text, className, step = 55 }: WordRevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLSpanElement>({ threshold: 0.3 });
  const words = text.split(" ");

  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden align-bottom"
        >
          <span
            className="inline-block"
            style={{
              transform: isVisible ? "translateY(0%)" : "translateY(110%)",
              opacity: isVisible ? 1 : 0,
              transition: `transform 700ms ${EASE} ${i * step}ms, opacity 700ms ${EASE} ${
                i * step
              }ms`,
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </span>
  );
}
