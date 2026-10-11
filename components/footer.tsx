"use client";

import { Magnetic } from "@/components/magnetic";
import { smoothScrollTo } from "@/components/smooth-scroll";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="light-block py-10">
      <div className="shell flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <span className="font-display text-sm font-medium">Atharv Puranik</span>
        <span className="label">© {year} Atharv Puranik · Bengaluru, India</span>
        <Magnetic as="span" strength={0.25}>
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo(0);
            }}
            className="label link-wipe hover:text-ink"
          >
            Back to top
          </a>
        </Magnetic>
      </div>
    </footer>
  );
}
