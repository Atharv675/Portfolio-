import { ScrollReveal, WordReveal } from "@/components/scroll-reveal";
import { Magnetic } from "@/components/magnetic";

const EMAIL = "atharv21305@gmail.com";
const GMAIL_COMPOSE = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent(
  "Let's work together",
)}&body=${encodeURIComponent("Hi Atharv,\n\n")}`;

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/atharv-puranik-7a1403334/" },
  { label: "GitHub", href: "https://github.com/Atharv675" },
  { label: "Gmail", href: GMAIL_COMPOSE },
  { label: "Résumé", href: "/atharv-puranik-resume.pdf" },
];

export function ContactSection() {
  return (
    <section
      id="contact"
      className="light-block relative overflow-hidden border-t py-24 md:py-36"
    >
      <div className="shell">
        <ScrollReveal>
          <span className="section-eyebrow">Let&apos;s work together</span>
        </ScrollReveal>

        <h2 className="mt-6 max-w-4xl font-display text-[clamp(2.2rem,5.2vw,4.5rem)] font-semibold leading-[1.0] tracking-[-0.03em]">
          <WordReveal text="Curiosity drives the build." />
        </h2>

        <div className="mt-10 flex flex-col gap-8 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label">Email</p>
            <Magnetic as="div" strength={0.15}>
              <a
                href={`mailto:${EMAIL}`}
                className="link-wipe font-display text-2xl font-medium md:text-4xl"
              >
                {EMAIL}
              </a>
            </Magnetic>
            <p className="mt-6 max-w-sm text-ink-70">
              Have a system that needs to be trusted? Send the context — I&apos;ll
              come back with where I&apos;d start.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {SOCIALS.map((s) => (
              <Magnetic as="span" strength={0.2} key={s.label}>
                <a
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="label link-wipe hover:text-ink"
                >
                  {s.label} ↗
                </a>
              </Magnetic>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
