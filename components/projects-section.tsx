"use client";

import { useMemo, useState } from "react";
import { LineReveal, ScrollReveal } from "@/components/scroll-reveal";
import { FieldBackdrop } from "@/components/field-backdrop";
import { Spotlight } from "@/components/spotlight";

interface Project {
  index: string;
  title: string;
  /** The Hook — what it is and who it's for. */
  hook: string;
  /** The Tech — tools / languages / software used. */
  stack: string[];
  /** The Result — data-driven impact or what was built. */
  result: string;
  /** Controlled vocabulary that drives the filter row. */
  domains: Domain[];
  /** Free-form display chips for scannability. */
  tags: string[];
  /** First entries get a larger typographic treatment. */
  featured?: boolean;
  href: string;
}

const DOMAINS = [
  "LLM security",
  "Detection engineering",
  "Threat intelligence",
  "Anomaly detection",
] as const;

type Domain = (typeof DOMAINS)[number];
type Filter = "All" | Domain;

const FILTERS: Filter[] = ["All", ...DOMAINS];

const PROJECTS: Project[] = [
  {
    index: "01",
    title: "Secure LLM API Key Vault & Envelope Encryption Gateway",
    hook: "A key-vault gateway that keeps third-party LLM credentials off the client, for teams shipping AI features without leaking provider keys.",
    stack: ["Python", "FastAPI", "HashiCorp Vault", "PostgreSQL", "Redis", "Docker"],
    result:
      "Provider keys sealed with AES-256-GCM envelope encryption, wrapped via Vault Transit, so a database breach alone yields nothing usable.",
    domains: ["LLM security"],
    tags: ["LLM security", "Key management", "Encryption"],
    featured: true,
    href: "https://github.com/Atharv675/Secure-API-Encryption-Vault",
  },
  {
    index: "02",
    title: "Endpoint Attack Reconstruction Engine (EDR)",
    hook: "An on-prem Windows EDR that rebuilds multi-step attack chains from endpoint telemetry, for SOC teams without a cloud-EDR budget.",
    stack: ["Python", "Splunk", "Sysmon", "Windows Event Logs", "MITRE ATT&CK"],
    result:
      "Correlates Sysmon + Event Logs into risk-scored chains, fires automated response, and grades its own coverage against MITRE ATT&CK.",
    domains: ["Detection engineering"],
    tags: ["Detection engineering", "EDR", "MITRE ATT&CK"],
    featured: true,
    href: "https://github.com/Atharv675/MINI---EDR-",
  },
  {
    index: "03",
    title: "Threat Intelligence & SOC Operations Platform",
    hook: "A two-stage platform turning open-source threat feeds into log-correlated detections, for analysts triaging IOCs at scale.",
    stack: ["Python", "FastAPI", "MongoDB", "OSINT Feeds", "D3.js"],
    result:
      "Enriches and matches IOCs against auth / nginx / DNS logs with behavioural heuristics, mapped on a D3 relationship graph.",
    domains: ["Threat intelligence", "Detection engineering"],
    tags: ["Threat intel", "SOC", "OSINT"],
    href: "https://github.com/Atharv675/Threat-Intelligence-SOC-",
  },
  {
    index: "04",
    title: "Identity Document Fraud Detection with an LLM Triage Layer",
    hook: "A layered fraud pipeline joining transaction scoring, ID-document forensics and an LLM case-triage agent, for fraud and risk ops.",
    stack: ["Python", "LightGBM", "PyTorch", "EfficientNet", "NVIDIA NIM", "MLflow"],
    result:
      "Velocity / entity-graph / deviation features plus document forensics; the triage LLM is calibration-checked, prompt-injection red-teamed and drift-monitored live.",
    domains: ["LLM security", "Anomaly detection"],
    tags: ["Fraud detection", "LLM triage", "ML"],
    href: "https://github.com/Atharv675/Identity-Document-Fraud-Detection-with-an-LLM-Triage-Layer",
  },
  {
    index: "05",
    title: "SQL Injection Intrusion Detection",
    hook: "A detection engine for SQL-injection attempts in live database traffic, for app and DB teams hardening against injection.",
    stack: ["Python", "scikit-learn", "Pattern Matching"],
    result:
      "Pairs signature patterns with a trained classifier to catch obfuscated and novel payloads that static rules miss.",
    domains: ["Detection engineering", "Anomaly detection"],
    tags: ["AppSec", "Anomaly detection"],
    href: "https://github.com/Atharv675/Sqli_Intrusion_Detection",
  },
  {
    index: "06",
    title: "ADS-B Spoofing Detection & Flight Integrity Platform",
    hook: "A software-only platform that flags spoofed and anomalous aircraft broadcasts from live ADS-B, for airspace-surveillance integrity.",
    stack: ["Python", "Kalman Filter", "scikit-learn", "FastAPI", "PostgreSQL", "Docker"],
    result:
      "Fuses Kalman tracking, NIS testing, Isolation Forest and simulated sensors into one suspicion score: 97.4% F1 on ghost aircraft, 0.5% false positives on clean traffic.",
    domains: ["Anomaly detection"],
    tags: ["Anomaly detection", "Sensor fusion", "Aviation"],
    href: "https://github.com/Atharv675/ADS-B-Spoofing-Detection-and-Flight-Integrity-Platform",
  },
];

export function ProjectsSection() {
  const [active, setActive] = useState<Filter>("All");

  const visible = useMemo(
    () =>
      active === "All"
        ? PROJECTS
        : PROJECTS.filter((p) => p.domains.includes(active)),
    [active],
  );

  return (
    <section id="projects" className="relative overflow-hidden py-28 md:py-44">
      <FieldBackdrop />
      <Spotlight />
      <div className="shell relative z-10">
        <div className="flex items-baseline justify-between gap-4">
          <LineReveal lines={["Selected work"]} className="section-eyebrow" />
          <span aria-live="polite" className="font-mono text-[13px] text-ink-30">
            {String(visible.length).padStart(2, "0")} /{" "}
            {String(PROJECTS.length).padStart(2, "0")}
          </span>
        </div>

        <ScrollReveal delay={60}>
          <div
            role="group"
            aria-label="Filter projects by domain"
            className="mt-6 flex flex-wrap gap-2"
          >
            {FILTERS.map((filter) => {
              const on = active === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(filter)}
                  className={`border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors ${
                    on
                      ? "border-ink-30 bg-paper-2 text-ink"
                      : "border-line text-ink-50 hover:border-ink-30 hover:text-ink"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        <ul className="mt-10">
          {visible.map((project, i) => {
            const featured = Boolean(project.featured);
            return (
              <ScrollReveal as="li" key={project.index} delay={i * 50}>
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.title}, open GitHub repository`}
                  className="group grid grid-cols-[auto_1fr_auto] items-start gap-x-6 border-t border-line py-8 last:border-b md:gap-x-10 md:py-10"
                >
                  <span className="mt-1.5 font-mono text-sm text-ink-30 transition-colors group-hover:text-accent">
                    {project.index}
                  </span>

                  <div className="min-w-0">
                    <h3
                      className={`font-display font-medium transition-transform duration-500 ease-out group-hover:translate-x-2 ${
                        featured
                          ? "text-[2.4rem] leading-[1.0] tracking-[-0.03em] md:text-[3.9rem]"
                          : "text-[1.7rem] leading-tight tracking-[-0.02em] md:text-[2.4rem]"
                      }`}
                    >
                      {project.title}
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-70">
                      {project.hook}
                    </p>
                    <p className="mt-2.5 font-mono text-[13px] uppercase tracking-wide text-ink-50">
                      {project.stack.join("  ·  ")}
                    </p>
                    <p className="mt-2.5 max-w-2xl text-[17px] leading-relaxed text-ink">
                      <span aria-hidden className="text-accent">
                        {"→ "}
                      </span>
                      {project.result}
                    </p>
                  </div>

                  <span
                    aria-hidden
                    className="mt-1 translate-x-[-8px] text-2xl text-accent opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
                  >
                    {"↗"}
                  </span>
                </a>
              </ScrollReveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
