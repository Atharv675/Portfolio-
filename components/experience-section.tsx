import { LineReveal, ScrollReveal } from "@/components/scroll-reveal";
import { ExperienceObject } from "@/components/experience-object";

interface Role {
  period?: string;
  role: string;
  org: string;
  summary: string;
  bullets: string[];
}

const EXPERIENCE: Role[] = [
  {
    role: "LLM Security Intern",
    org: "EvoluteIQ",
    summary:
      "Worked on securing generative AI and RAG-based applications against LLM-specific attack vectors, with a focus on defensive controls, API security, and retrieval security.",
    bullets: [
      "Evaluated generative AI workflows built with Ollama, Open WebUI, Qdrant, and RAG against real-world attack vectors to identify security weaknesses.",
      "Performed offensive security testing aligned with the OWASP Top 10 for LLM Applications (2025) and implemented layered defensive controls to address identified vulnerabilities.",
      "Engineered an AES-256-GCM envelope encryption framework with secure key management, audit logging, and secret protection to strengthen API security.",
      "Implemented input/output filtering, structured response validation, and retrieval-security controls to reduce attack surface across RAG-based applications.",
    ],
  },
];

export function ExperienceSection() {
  return (
    <section id="experience" className="border-t border-line py-24 md:py-32">
      <div className="shell grid gap-12 md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-16">
        <div>
          <LineReveal
            lines={["Experience"]}
            className="font-display text-[clamp(2rem,3.6vw,2.9rem)] font-medium leading-[1.06] tracking-[-0.03em]"
          />

          <ul className="mt-10">
            {EXPERIENCE.map((item, i) => (
            <ScrollReveal as="li" key={`${item.org}-${i}`} delay={i * 60}>
              <div
                className={`grid grid-cols-1 gap-y-3 border-t border-line py-8 last:border-b md:gap-x-10 md:py-10 ${
                  item.period ? "md:grid-cols-[10rem_1fr]" : ""
                }`}
              >
                {item.period && (
                  <span className="mt-1 font-mono text-xs uppercase tracking-wide text-ink-50">
                    {item.period}
                  </span>
                )}

                <div className="max-w-2xl">
                  <h3 className="font-display text-[1.7rem] font-medium leading-tight md:text-[2.1rem]">
                    {item.role}
                  </h3>
                  <p className="mt-1.5 font-mono text-[13px] uppercase tracking-wide text-ink-50">
                    {item.org}
                  </p>

                  <p className="mt-4 text-[17px] leading-relaxed text-ink-70">
                    {item.summary}
                  </p>

                  <ul className="mt-4 space-y-2.5">
                    {item.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex gap-3 text-[17px] leading-relaxed text-ink-70"
                      >
                        <span aria-hidden className="mt-1 shrink-0 text-accent">
                          -
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              </ScrollReveal>
            ))}
          </ul>
        </div>

        <div className="hidden md:flex md:items-center md:justify-center">
          <ExperienceObject />
        </div>
      </div>
    </section>
  );
}
