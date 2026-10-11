import { LineReveal, ScrollReveal, Stagger } from "@/components/scroll-reveal";

interface Category {
  title: string;
  items: string[];
}

const CATEGORIES: Category[] = [
  {
    title: "Development",
    items: [
      "Python",
      "C",
      "Java",
      "MySQL · MongoDB · PostgreSQL",
      "Git · GitHub",
    ],
  },
  {
    title: "AI / Machine Learning",
    items: [
      "Machine Learning",
      "RAG",
      "Qdrant · Vector Search",
      "Ollama",
      "Anomaly Detection",
    ],
  },
  {
    title: "Security & Intelligence",
    items: [
      "Threat Hunting",
      "OSINT",
      "Splunk",
      "Nmap · Strix",
      "ISO 27001",
    ],
  },
  {
    title: "Cloud & DevOps",
    items: ["Azure", "Docker", "Jenkins", "SonarQube", "CI/CD"],
  },
];

export function SkillsSection() {
  return (
    <section id="skills" className="border-t border-line py-28 md:py-44">
      <div className="shell">
        <ScrollReveal>
          <div className="flex items-baseline justify-between">
            <h2 className="section-eyebrow">Capabilities</h2>
            <span className="section-eyebrow">/ 04 sets /</span>
          </div>
        </ScrollReveal>
        <LineReveal
          as="p"
          lines={["The toolkit behind the work."]}
          className="mt-6 max-w-2xl font-display text-[clamp(2.2rem,4.4vw,3.5rem)] font-medium leading-[1.06] tracking-[-0.03em]"
        />

        <div className="mt-16 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category, i) => (
            <div key={category.title}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] text-ink-30">
                  0{i + 1}
                </span>
                <h3 className="font-mono text-[13px] uppercase tracking-[0.16em] text-ink-50">
                  {category.title}
                </h3>
              </div>
              <Stagger className="mt-5 space-y-1" step={70}>
                {category.items.map((item) => (
                  <div
                    key={item}
                    className="group flex items-center justify-between border-b border-line py-3 text-lg transition-colors hover:text-accent"
                  >
                    <span>{item}</span>
                    <span
                      aria-hidden
                      className="translate-x-[-6px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    >
                      →
                    </span>
                  </div>
                ))}
              </Stagger>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
