import { Navigation } from "@/components/navigation";
import { ScrollRail } from "@/components/scroll-rail";
import { SectionTint } from "@/components/section-tint";
import { HeroSection } from "@/components/hero-section";
import { MarqueeSection } from "@/components/marquee-section";
import { ProjectsSection } from "@/components/projects-section";
import { AboutSection } from "@/components/about-section";
import { ExperienceSection } from "@/components/experience-section";
import { SkillsSection } from "@/components/skills-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navigation />
      <ScrollRail />
      <SectionTint />
      <main id="main">
        <h1 className="sr-only">
          Atharv Puranik — security engineer for AI systems and detection
          pipelines
        </h1>
        <HeroSection />
        <div className="curtain">
          <MarqueeSection />
          <ProjectsSection />
        </div>
        <AboutSection />
        <ExperienceSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
