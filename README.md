# Atharv Puranik — Portfolio

Personal portfolio for **Atharv Puranik**, a cybersecurity & cloud security engineer.

**Design language:** warm-paper editorial — near-monochrome ink on paper, one vermilion
accent used sparingly, large grotesque headlines, monospace metadata labels, generous
whitespace, big stacked project rows, subtle scroll reveals and pointer interactions.
Visual reference: benjamincreative.me (aesthetic only — content is Atharv's).

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS 3**, theme tokens in `app/globals.css`
- Fonts via `next/font`: **Space Grotesk** (display), **DM Sans** (body), **Space Mono** (labels)
- No animation library — motion is hand-rolled with IntersectionObserver + rAF

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
```

## Structure

```
app/
  globals.css   # palette tokens, type helpers (.font-display/.label/.display-*), grain, keyframes
  layout.tsx    # fonts + metadata
  page.tsx      # section order
components/
  navigation.tsx        # transparent over hero, settles onto paper on scroll
  scroll-progress.tsx   # thin accent scroll-depth bar
  hero-section.tsx      # line-by-line headline reveal, pointer parallax, spinning asterisk mark
  marquee-section.tsx   # infinite focus-area band, pause on hover
  projects-section.tsx  # big stacked rows + cursor-following case-study preview card
  manifesto-section.tsx # word-by-word reveal — "Assume breach / Trust nothing / Verify everything"
  about-section.tsx     # editorial bio + count-up stats
  skills-section.tsx    # four capability sets as clean staggered lists
  contact-section.tsx   # oversized "Start a review" + magnetic email + socials
  footer.tsx
  magnetic.tsx          # cursor-follow wrapper for buttons / links
  scroll-reveal.tsx     # ScrollReveal, Stagger, WordReveal primitives
hooks/
  use-scroll-reveal.ts  # IntersectionObserver hook + direction offsets
  use-count-up.ts        # ease-out count-up when scrolled into view
```

## Hero reveal

`components/gooey-reveal.tsx` implements the Lando-Norris-style cursor reveal: two stacked
`<image>` layers in one SVG, the overlay masked by a gooey metaball (SVG `feGaussianBlur` +
`feColorMatrix`) that chases the cursor with a 4-circle eased trail, stretches along its
velocity, and edge-wobbles via animated `feTurbulence` + `feDisplacementMap`.

Layers live in `public/` — `hero-portrait.png` (base, always visible) and `hero-overlay.png`
(revealed under the blob), both 558×447 RGBA. Swap for any matched-pose pair; update
`width`/`height` + the `aspect-[…]` class in `hero-section.tsx` if the ratio changes.
Tuning knobs are the constants at the top of `gooey-reveal.tsx`.

## Still to supply

| File | Used by |
| --- | --- |
| `public/atharv-puranik-resume.pdf` | Contact "Résumé" link |

All copy is placeholder — email `hello@atharvpuranik.com`, stat numbers, project blurbs,
social URLs, "Pune, IN". Edit in the respective component files.
