import type { Metadata } from "next";
import {
  Space_Grotesk,
  DM_Sans,
  Space_Mono,
  Unbounded,
  JetBrains_Mono,
} from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
  weight: ["400", "700"],
});

// Hero section (replicated from the "Portfolio website" project) uses these.
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://atharvpuranik.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: "Atharv Puranik — Cybersecurity & Cloud Security",
  description:
    "Atharv Puranik is a cybersecurity and cloud security engineer working on zero-trust architecture, cloud security frameworks, threat detection and incident response automation.",
  keywords: [
    "Atharv Puranik",
    "Cybersecurity",
    "Cloud Security",
    "AWS Security",
    "Zero Trust",
    "Threat Detection",
    "Incident Response",
    "LLM Security",
    "Detection Engineering",
  ],
  authors: [{ name: "Atharv Puranik" }],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Atharv Puranik — Cybersecurity & Cloud Security",
    description:
      "Zero-trust architecture, cloud security frameworks, threat detection and incident response automation.",
    type: "website",
    images: [
      { url: "/hero-portrait.png", width: 558, height: 447, alt: "Atharv Puranik" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atharv Puranik — Cybersecurity & Cloud Security",
    description:
      "Zero-trust architecture, cloud security frameworks, threat detection and incident response automation.",
    images: ["/hero-portrait.png"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Atharv Puranik",
  jobTitle: "Security Engineer",
  description:
    "Security engineer working on AI/LLM security, detection engineering and threat intelligence.",
  sameAs: [
    "https://www.linkedin.com/in/atharv-puranik-7a1403334/",
    "https://github.com/Atharv675",
  ],
  knowsAbout: [
    "LLM Security",
    "Cloud Security",
    "Threat Intelligence",
    "Detection Engineering",
    "Incident Response",
    "Zero Trust",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} ${spaceMono.variable} ${unbounded.variable} ${jetbrainsMono.variable} grain antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
