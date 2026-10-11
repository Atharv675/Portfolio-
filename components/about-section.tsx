"use client";

import { LineReveal, ScrollReveal } from "@/components/scroll-reveal";

export function AboutSection() {
  return (
    <section id="about" className="py-28 md:py-44">
      <div className="shell grid gap-16 md:grid-cols-[0.9fr_1.1fr] md:gap-24">
        <div>
          <ScrollReveal>
            <h2 className="section-eyebrow">About me</h2>
          </ScrollReveal>
          <LineReveal
            as="p"
            lines={["I build intelligent systems.", "I make them secure."]}
            className="mt-6 font-display text-[clamp(2.4rem,4.8vw,4rem)] font-medium leading-[1.06] tracking-[-0.03em]"
          />
        </div>

        <ScrollReveal delay={80}>
          <div className="space-y-5 text-xl leading-relaxed text-ink-70">
            <p>
              I&apos;m Atharv Puranik, a builder working at the intersection of
              Cybersecurity, AI, Cloud, and Defence Technology. My work spans
              agentic AI security, threat intelligence, and geospatial
              analytics, focused on solving security problems that matter in the
              real world.
            </p>
            <p>
              I&apos;m driven by complex problems, secure engineering, and the
              challenge of turning emerging technology into systems that are
              scalable, resilient, and useful.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
