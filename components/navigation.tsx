"use client";

import { useEffect, useState } from "react";
import { getLenis, smoothScrollTo } from "@/components/smooth-scroll";

const LINKS = [
  { href: "#hero", label: "Home", id: "01" },
  { href: "#projects", label: "Selected Work", id: "02" },
  { href: "#about", label: "About", id: "03" },
  { href: "#experience", label: "Experience", id: "04" },
  { href: "#skills", label: "Skills", id: "05" },
  { href: "#contact", label: "Contact", id: "06" },
];

const RESUME_HREF = "/atharv-puranik-resume.pdf";

/**
 * Minimal top bar (hidden while the hero, which carries its own top bar, is on
 * screen) plus a fullscreen overlay menu opened by the hero's hamburger
 * (#hero-menu-btn) or the bar's own toggle.
 */
export function Navigation() {
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("hero");

  // Reveal the bar once the hero is mostly scrolled away (no scroll listener).
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      setPastHero(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setPastHero(entry.intersectionRatio < 0.2),
      { threshold: [0, 0.2, 0.5, 1] },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // Track which section is in view for active-link highlighting.
  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // The hamburger lives inside <HeroSection>; wire its click here.
  useEffect(() => {
    const heroBtn = document.getElementById("hero-menu-btn");
    if (!heroBtn) return;
    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setMenuOpen((v) => !v);
    };
    heroBtn.addEventListener("click", onClick);
    return () => heroBtn.removeEventListener("click", onClick);
  }, []);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll while the menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) getLenis()?.stop();
    else getLenis()?.start();
    return () => {
      document.body.style.overflow = "";
      getLenis()?.start();
    };
  }, [menuOpen]);

  const go = (href: string) => {
    setMenuOpen(false);
    if (href === "#hero") smoothScrollTo(0);
    else smoothScrollTo(href);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          pastHero
            ? "translate-y-0 border-line bg-[rgba(17,14,8,0.72)] text-ink opacity-100 backdrop-blur-md"
            : "-translate-y-full border-transparent opacity-0"
        }`}
      >
        <nav className="shell flex h-16 items-center justify-between">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              go("#hero");
            }}
            className="font-display text-[15px] font-medium tracking-tight"
          >
            Atharv Puranik
          </a>

          <ul className="hidden items-center gap-7 md:flex">
            {LINKS.filter((l) => l.href !== "#hero").map((link) => {
              const active = activeId === link.href.slice(1);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={active ? "true" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      go(link.href);
                    }}
                    className={`font-mono text-[12px] uppercase tracking-[0.14em] transition-colors hover:text-accent ${
                      active ? "text-ink" : "text-ink-50"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-4">
            <a
              href={RESUME_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden font-mono text-[12px] uppercase tracking-[0.14em] text-ink-50 transition-colors hover:text-accent md:inline"
            >
              Résumé
            </a>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-50 transition-colors hover:text-accent md:hidden"
            >
              Menu
            </button>
          </div>
        </nav>
      </header>

      {/* Fullscreen overlay menu */}
      <div
        className="fixed inset-0 z-[100] flex flex-col justify-between overflow-y-auto p-6 transition-all duration-500 sm:p-10 md:p-16"
        style={{
          background: "rgba(15, 14, 10, 0.97)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transform: menuOpen
            ? "translateY(0) scale(1)"
            : "translateY(-12px) scale(0.99)",
        }}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between border-b border-white/15 pb-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
            Navigation
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 rounded border border-[rgba(216,69,42,0.4)] px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-accent transition-colors hover:bg-[rgba(216,69,42,0.1)]"
          >
            <span>[ESC]</span> Close
          </button>
        </div>

        <div className="mx-auto my-auto w-full max-w-3xl py-8">
          <ul className="space-y-5 md:space-y-8">
            {LINKS.map((link) => (
              <li key={link.href} className="group">
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(link.href);
                  }}
                  className="flex items-baseline gap-4 transition-transform duration-300 group-hover:translate-x-3 md:gap-8"
                >
                  <span className="shrink-0 font-mono text-xs tracking-widest text-[rgba(216,69,42,0.7)] md:text-sm">
                    {link.id}
                  </span>
                  <span className="font-display text-3xl font-bold uppercase tracking-tight text-[#f4f2ed] transition-colors duration-300 group-hover:text-accent sm:text-4xl md:text-6xl">
                    {link.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href={RESUME_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-block font-mono text-[11px] uppercase tracking-[0.2em] text-[rgba(244,242,237,0.55)] transition-colors hover:text-accent"
          >
            Résumé
          </a>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 font-mono text-[11px] uppercase tracking-widest text-white/45 sm:flex-row">
          <span>Atharv Puranik, Cybersecurity &amp; Cloud Security</span>
          <span>Select a section to navigate</span>
        </div>
      </div>
    </>
  );
}
