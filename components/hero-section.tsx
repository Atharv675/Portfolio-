"use client"

import { useEffect, useRef, useCallback } from "react"
import { smoothScrollTo } from "@/components/smooth-scroll"

/*
  HERO — Exact Lando Norris-style interactive hero with Liquid Blob Masking
  ─────────────────────────────────────────────────────────────────────────
  REPLICATING LANDO NORRIS INTERACTION MECHANICS:

  1. STATIC LAYER ALIGNMENT (No more gaps):
     - Both face and goggles layers are statically overlayed (translateY 0%)
       at all times, meaning they align pixel-perfectly with zero seams.

  2. LIQUID METABALL MASKING (Cursor-Reactive reveal):
     - An SVG mask with a gooey filter combines three tracking circles that lag
       slightly behind each other to form a morphing liquid blob.
     - The goggles/hood are ONLY revealed inside this morphing blob following the mouse.

  3. VELOCITY-BASED MASK STRETCHING:
     - Measures mouse speed and direction dynamically.
     - Scales and rotates the entire blob mask along the movement vector
       to mimic organic fluid/droplet behavior.

  4. MASK EDGE SHIMMER/RIZZLE:
     - Applies SVG `<feTurbulence>` and `<feDisplacementMap>` to the gooey filter.
     - Continuously oscillates the base frequency to create a wobbly,
       organic liquid edge boundary animation.

  5. OPPOSITE BACKGROUND MOUSE PARALLAX:
     - Translates background contours and glowing color blobs in the opposite
       direction of the cursor, multiplying the 3D perspective layout depth.
  ─────────────────────────────────────────────────────────────────────────
*/

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const baseRef    = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const bgRef      = useRef<HTMLDivElement>(null)
  const blobsRef   = useRef<HTMLDivElement>(null)
  const reflectionRef = useRef<HTMLDivElement>(null)
  const rafRef     = useRef<number>(0)
  const tickRef    = useRef<() => void>(() => {})

  // Liquid mask SVG refs
  const maskGroupRef   = useRef<SVGGElement>(null)
  const circle1Ref     = useRef<SVGCircleElement>(null)
  const circle2Ref     = useRef<SVGCircleElement>(null)
  const circle3Ref     = useRef<SVGCircleElement>(null)
  const turbulenceRef  = useRef<SVGFETurbulenceElement>(null)

  // Target and current mouse coordinates for 3D tilt (range -0.5 to 0.5)
  const tMouseX = useRef(0)
  const tMouseY = useRef(0)
  const cMouseX = useRef(0)
  const cMouseY = useRef(0)

  // Mask positions relative to portrait container
  const tMaskX = useRef(0)
  const tMaskY = useRef(0)

  // Lagged positions for the liquid blob effect
  const cMaskX1 = useRef(0)
  const cMaskY1 = useRef(0)
  const cMaskX2 = useRef(0)
  const cMaskY2 = useRef(0)
  const cMaskX3 = useRef(0)
  const cMaskY3 = useRef(0)

  // Velocity and stretch vectors
  const lastTime = useRef(0)
  const tVelocity = useRef(0)
  const cVelocity = useRef(0)
  const tAngle = useRef(0)
  const cAngleCos = useRef(1)
  const cAngleSin = useRef(0)

  // Mask radius: expands to 175px on hover, contracts to 0 on leave
  const tMaskRadius = useRef(0)
  const cMaskRadius = useRef(0)

  // Scroll parallax
  const tScroll = useRef(0)
  const cScroll = useRef(0)

  // Ripple animation time
  const rippleTime = useRef(0)

  // Intro auto-sweep — true while page-load animation is running
  const introActiveRef = useRef(true)

  // Initialize coordinate centers once rect is available
  useEffect(() => {
    if (baseRef.current) {
      const rect = baseRef.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      tMaskX.current = centerX
      tMaskY.current = centerY
      cMaskX1.current = centerX; cMaskY1.current = centerY
      cMaskX2.current = centerX; cMaskY2.current = centerY
      cMaskX3.current = centerX; cMaskY3.current = centerY
    }
    lastTime.current = performance.now()
  }, [])

  // ── RAF animation loop ────────────────────────────────────
  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      // Smooth interpolation (lerp)
      cScroll.current  = lerp(cScroll.current,  tScroll.current,  0.09)
      cMouseX.current  = lerp(cMouseX.current,  tMouseX.current,  0.08)
      cMouseY.current  = lerp(cMouseY.current,  tMouseY.current,  0.08)

      // Lerp mask positions at different speeds for organic lag/stretch
      cMaskX1.current = lerp(cMaskX1.current, tMaskX.current, 0.09)
      cMaskY1.current = lerp(cMaskY1.current, tMaskY.current, 0.09)

      cMaskX2.current = lerp(cMaskX2.current, tMaskX.current, 0.055)
      cMaskY2.current = lerp(cMaskY2.current, tMaskY.current, 0.055)

      cMaskX3.current = lerp(cMaskX3.current, tMaskX.current, 0.035)
      cMaskY3.current = lerp(cMaskY3.current, tMaskY.current, 0.035)

      cMaskRadius.current = lerp(cMaskRadius.current, tMaskRadius.current, 0.08)

      // Lerp velocity & angle components
      cVelocity.current = lerp(cVelocity.current, tVelocity.current, 0.08)
      cAngleCos.current = lerp(cAngleCos.current, Math.cos(tAngle.current), 0.08)
      cAngleSin.current = lerp(cAngleSin.current, Math.sin(tAngle.current), 0.08)

      const sc = cScroll.current
      const mx = cMouseX.current
      const my = cMouseY.current
      const r  = cMaskRadius.current

      // Decay velocity slowly back to 0
      tVelocity.current = lerp(tVelocity.current, 0, 0.06)

      // Calculate 3D rotations based on mouse position
      const rotY = mx * 22
      const rotX = -my * 18

      // Base layer (face) & Overlay layer (goggles/jacket) share exact same translation and rotation
      // to keep them perfectly aligned with no double-image or gaps at any cursor position.
      const tx = mx * 20
      const ty = my * 20 + (-sc * 0.2)

      if (baseRef.current) {
        baseRef.current.style.transform =
          `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0px)`
      }

      if (overlayRef.current) {
        overlayRef.current.style.transform =
          `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0px)`
      }

      // Opposite background parallax
      const bgTx = -mx * 25
      const bgTy = -my * 25
      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${bgTx.toFixed(2)}px, ${bgTy.toFixed(2)}px, 0px)`
      }

      const blobsTx = -mx * 40
      const blobsTy = -my * 40
      if (blobsRef.current) {
        blobsRef.current.style.transform = `translate3d(${blobsTx.toFixed(2)}px, ${blobsTy.toFixed(2)}px, 0px)`
      }

      // Opposite goggles reflection sweep
      const refTx = -mx * 75
      const refTy = -my * 75
      if (reflectionRef.current) {
        reflectionRef.current.style.transform = `translate3d(${refTx.toFixed(2)}px, ${refTy.toFixed(2)}px, 0px)`
      }

      // Update mask circle positions (subtracting element translations to anchor in screen-coordinates)
      if (circle1Ref.current) {
        circle1Ref.current.setAttribute("cx", (cMaskX1.current - tx).toFixed(1))
        circle1Ref.current.setAttribute("cy", (cMaskY1.current - ty).toFixed(1))
        circle1Ref.current.setAttribute("r", r.toFixed(1))
      }
      if (circle2Ref.current) {
        circle2Ref.current.setAttribute("cx", (cMaskX2.current - tx).toFixed(1))
        circle2Ref.current.setAttribute("cy", (cMaskY2.current - ty).toFixed(1))
        circle2Ref.current.setAttribute("r", (r * 0.75).toFixed(1))
      }
      if (circle3Ref.current) {
        circle3Ref.current.setAttribute("cx", (cMaskX3.current - tx).toFixed(1))
        circle3Ref.current.setAttribute("cy", (cMaskY3.current - ty).toFixed(1))
        circle3Ref.current.setAttribute("r", (r * 0.55).toFixed(1))
      }

      // Stretch & rotate the gooey mask group based on speed & angle vector
      if (maskGroupRef.current) {
        const cx = cMaskX1.current - tx
        const cy = cMaskY1.current - ty
        const stretch = 1 + cVelocity.current * 0.45
        const squeeze = 1 / (1 + cVelocity.current * 0.22)
        const angleRad = Math.atan2(cAngleSin.current, cAngleCos.current)
        const angleDeg = angleRad * 180 / Math.PI

        maskGroupRef.current.setAttribute(
          "transform",
          `translate(${cx.toFixed(1)}, ${cy.toFixed(1)}) rotate(${angleDeg.toFixed(1)}) scale(${stretch.toFixed(3)}, ${squeeze.toFixed(3)}) translate(${-cx.toFixed(1)}, ${-cy.toFixed(1)})`
        )
      }

      // Animate edge ripple turbulence
      rippleTime.current += 0.03
      if (turbulenceRef.current) {
        const baseFreq = 0.015 + Math.sin(rippleTime.current) * 0.0035
        turbulenceRef.current.setAttribute("baseFrequency", baseFreq.toFixed(4))
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    tickRef.current = tick
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // ── Pause/resume the RAF loop when the hero scrolls off-screen ──
  // Keeps the same animation, just stops paying its CPU/battery cost
  // once the user has scrolled past it.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(tickRef.current)
          }
          blobsRef.current?.classList.remove("hero-blobs-paused")
        } else {
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = 0
          }
          // The colour blob's drift is a plain CSS animation — JS pausing
          // the tick loop above doesn't stop it, so pause it explicitly too.
          blobsRef.current?.classList.add("hero-blobs-paused")
        }
      },
      { threshold: 0 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  // ── Mouse tracking ────────────────────────────────────────
  const onMouseMove = useCallback((e: MouseEvent) => {
    introActiveRef.current = false // user took over — stop intro
    const section = sectionRef.current
    const wrap = baseRef.current
    if (!section || !wrap) return

    const rect = section.getBoundingClientRect()
    const wrapRect = wrap.getBoundingClientRect()

    const now = performance.now()
    const dt = Math.max(1, now - lastTime.current)
    lastTime.current = now

    // Relative coordinates for 3D tilt
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))

    tMouseX.current = relX - 0.5
    tMouseY.current = relY - 0.5

    // Absolute position relative to container
    const nextX = e.clientX - wrapRect.left
    const nextY = e.clientY - wrapRect.top

    // Calculate speed (velocity vector)
    const dx = nextX - tMaskX.current
    const dy = nextY - tMaskY.current
    const dist = Math.sqrt(dx*dx + dy*dy)
    const speed = dist / dt

    tMaskX.current = nextX
    tMaskY.current = nextY
    tMaskRadius.current = 175 // Expand mask showing goggles & full body

    // Update target velocity and angle of motion
    tVelocity.current = Math.min(1.4, speed) // Cap speed stretch
    if (dist > 1.5) {
      tAngle.current = Math.atan2(dy, dx)
    }
  }, [])

  // On leave → return to default state (mask collapses, face fully visible)
  const onMouseLeave = useCallback(() => {
    tMaskRadius.current = 0
    tMouseX.current = 0
    tMouseY.current = 0
    tVelocity.current = 0
    if (baseRef.current) {
      const rect = baseRef.current.getBoundingClientRect()
      tMaskX.current = rect.width / 2
      tMaskY.current = rect.height / 2
    }
  }, [])

  // Scroll tracking
  const onScroll = useCallback(() => {
    tScroll.current = window.scrollY
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    window.addEventListener("mousemove",    onMouseMove,   { passive: true })
    window.addEventListener("scroll",       onScroll,      { passive: true })
    section?.addEventListener("mouseleave", onMouseLeave)
    return () => {
      window.removeEventListener("mousemove",    onMouseMove)
      window.removeEventListener("scroll",       onScroll)
      section?.removeEventListener("mouseleave", onMouseLeave)
    }
  }, [onMouseMove, onMouseLeave, onScroll])

  // ── Page-load intro sweep (L→R then R→L, Lando Norris style) ─────
  useEffect(() => {
    let introRaf = 0
    const delay = setTimeout(() => {
      if (!baseRef.current) return
      const rect = baseRef.current.getBoundingClientRect()
      const W = rect.width
      const H = rect.height
      const FY = H * 0.58  // aligned across the shoulder line of the portrait

      // Pre-snap: place blob at left edge instantly (no lerp drift from center)
      tMaskX.current = -175; tMaskY.current = FY; tMaskRadius.current = 175
      cMaskX1.current = -175; cMaskY1.current = FY
      cMaskX2.current = -175; cMaskY2.current = FY
      cMaskX3.current = -175; cMaskY3.current = FY
      cMaskRadius.current = 175

      // [timeMs, maskX, maskY, radius, velocity, angle, mouseX, mouseY]
      // Phase 1 (0–550ms):   L → R sweep
      // Phase 2 (650–1200ms): R → L sweep  (snap to right edge at phase boundary)
      // Phase 3 (1200–1400ms): collapse
      type KF = [number,number,number,number,number,number,number,number]
      const KFs: KF[] = [
        [0,    -175,   FY, 175, 0.0, 0,         0, 0],
        [550,  W+175,  FY, 175, 1.4, 0,         0, 0],
        [650,  W+175,  FY, 175, 0.2, Math.PI,   0, 0],
        [1200, -175,   FY, 175, 1.4, Math.PI,   0, 0],
        [1400, -175,   FY, 0,   0.0, 0,         0, 0],
      ]

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t
      const eio  = (t: number) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t

      let prevKaIdx = 0
      const t0 = performance.now()

      const tick = () => {
        if (!introActiveRef.current) return
        const el = performance.now() - t0
        const last = KFs[KFs.length - 1]

        if (el >= last[0]) {
          tMaskRadius.current = 0; tVelocity.current = 0
          tMouseX.current = 0;    tMouseY.current = 0
          introActiveRef.current = false
          return
        }

        let kaIdx = 0, ka = KFs[0], kb = KFs[1]
        for (let i = 0; i < KFs.length - 1; i++) {
          if (el >= KFs[i][0] && el < KFs[i+1][0]) {
            kaIdx = i; ka = KFs[i]; kb = KFs[i+1]; break
          }
        }

        // Entering R→L phase: snap circles to right edge
        if (prevKaIdx !== kaIdx && kaIdx === 2) {
          cMaskX1.current = W+175; cMaskY1.current = FY
          cMaskX2.current = W+175; cMaskY2.current = FY
          cMaskX3.current = W+175; cMaskY3.current = FY
          cMaskRadius.current = 175
        }
        prevKaIdx = kaIdx

        const t = (el - ka[0]) / (kb[0] - ka[0])
        const e = eio(Math.max(0, Math.min(1, t)))

        tMaskX.current      = lerp(ka[1], kb[1], e)
        tMaskY.current      = lerp(ka[2], kb[2], e)
        tMaskRadius.current = lerp(ka[3], kb[3], e)
        tVelocity.current   = lerp(ka[4], kb[4], e)
        tAngle.current      = lerp(ka[5], kb[5], e)
        tMouseX.current     = lerp(ka[6], kb[6], e)
        tMouseY.current     = lerp(ka[7], kb[7], e)

        introRaf = requestAnimationFrame(tick)
      }

      introRaf = requestAnimationFrame(tick)
    }, 150)

    return () => {
      clearTimeout(delay)
      cancelAnimationFrame(introRaf)
    }
  }, [])

  return (
    <section ref={sectionRef} id="hero" className="hero-root">

      {/* ── SVG Liquid Mask Definition ────────────────────── */}
      <svg width="0" height="0" style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <defs>
          {/* Gooey filter combining blur, matrix consolidation, and wobbly turbulence */}
          <filter id="hero-gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              result="goo"
            />
            {/* Turbulence for wobbly organic edges */}
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="goo"
              in2="noise"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feComposite in="SourceGraphic" in2="displaced" operator="atop" />
          </filter>

          {/* Mask that hides overlay by default, revealing it only under morphing blobs */}
          <mask id="hero-liquid-mask">
            <rect width="100%" height="100%" fill="black" />
            <g ref={maskGroupRef} filter="url(#hero-gooey-filter)">
              <circle ref={circle1Ref} cx="280" cy="220" r="0" fill="white" />
              <circle ref={circle2Ref} cx="280" cy="220" r="0" fill="white" />
              <circle ref={circle3Ref} cx="280" cy="220" r="0" fill="white" />
            </g>
          </mask>
        </defs>
      </svg>

      {/* ── Colour blobs (Parallax-connected) ──────────────── */}
      <div ref={blobsRef} className="hero-blobs" aria-hidden="true" style={{ willChange: "transform" }}>
        <div className="hero-blob hero-blob-sky" />
      </div>

      {/* Animated topographic background (Parallax-connected) ── */}
      <div ref={bgRef} className="hero-bg" aria-hidden="true" style={{ willChange: "transform" }}>
        <AnimatedTopoBackground />
      </div>

      {/* Edge vignettes */}
      <div className="hero-vignette-left"  aria-hidden="true" />
      <div className="hero-vignette-right" aria-hidden="true" />

      {/* ── Top bar ─────────────────────────────────────── */}
      <header className="hero-topbar">
        <div>
          <div className="hero-name">
            <span>ATHARV</span>
            <span>PURANIK</span>
          </div>
          <p className="hero-tagline">
            Engineering Cyber Resilience Through Threat Intelligence Systems
          </p>
        </div>

        <div className="hero-actions">
          <a
            href="/atharv-puranik-resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-resume-btn"
            id="hero-resume-btn"
          >
            RESUME
          </a>
          <a
            href="#contact"
            className="hero-cta"
            id="hero-contact-btn"
            onClick={(e) => {
              e.preventDefault()
              smoothScrollTo("#contact")
            }}
          >
            <span className="hero-cta-star" aria-hidden="true">✦</span>
            CONTACT
          </a>
          <button className="hero-hamburger" aria-label="Menu" id="hero-menu-btn">
            <span /><span />
          </button>
        </div>
      </header>

      {/* Soft contact shadow — grounds the portrait against the topo bg */}
      <div className="hero-portrait-shadow" aria-hidden="true" />

      {/* ── Portrait — base + masked overlay layers ──────── */}
      <div className="hero-portrait-wrap">

        {/* BASE — face, always visible beneath the overlay */}
        <div ref={baseRef} className="hero-layer hero-layer-base">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-portrait.png"
            alt="Atharv Puranik"
            className="hero-img"
            draggable="false"
          />
        </div>

        {/* OVERLAY — goggles/jacket, statically aligned but masked via SVG */}
        <div
          ref={overlayRef}
          className="hero-layer hero-layer-overlay"
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-overlay.png"
            alt=""
            className="hero-img"
            draggable="false"
          />
          {/* Reactive Goggle Reflection Sweep */}
          <div
            ref={reflectionRef}
            className="hero-goggle-reflection"
            style={{ willChange: "transform" }}
          />
        </div>
      </div>

      {/* ── Status card — bottom left ────────────────────── */}
      <aside className="hero-card">
        <p className="hero-card-label">STATUS</p>
        <h2 className="hero-card-title">OPEN TO<br />WORK</h2>
        <div className="hero-card-divider" />
        <ul className="hero-card-stats">
          <li className="hero-card-stat">
            <span className="hero-card-diamond" aria-hidden="true">◆</span>
            CLOUD SECURITY
          </li>
          <li className="hero-card-stat">
            <span className="hero-card-diamond" aria-hidden="true">◆</span>
            THREAT INTEL
          </li>
        </ul>
      </aside>

      {/* ── Rotating CTA — bottom right ──────────────────── */}
      <button
        className="hero-rotating-btn"
        id="hero-view-work-btn"
        aria-label="View my work"
        onClick={() =>
          document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
        }
      >
        <svg className="hero-rotating-svg" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <path
              id="heroCirclePath"
              d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            />
          </defs>
          <text fontSize="8.2" letterSpacing="2.4" fontFamily="'JetBrains Mono', monospace">
            <textPath href="#heroCirclePath" fill="rgba(0,0,0,0.55)">
              VIEW MY WORK · VIEW MY WORK ·{" "}
            </textPath>
          </text>
        </svg>
        <span className="hero-rotating-arrow" aria-hidden="true">↓</span>
      </button>

    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   ANIMATED TOPOGRAPHIC BACKGROUND
   ══════════════════════════════════════════════════════════════════
   • Near-white background  #f4f3ef
   • Thin warm-gray flowing contour lines
   • Animated by domain-warped FBM noise (2 warp passes)
   • 8 contour threshold levels → organic topo-map look

   The canvas is created IMPERATIVELY via document.createElement
   inside useEffect — NOT as a React JSX element. This bypasses
   Next.js hydration and ensures WebGL initialises correctly.
═══════════════════════════════════════════════════════════════════ */
function AnimatedTopoBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    /* Create canvas via JS — guaranteed client-side, no SSR */
    const canvas = document.createElement("canvas")
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;"
    container.appendChild(canvas)

    const gl = (
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl")
    ) as WebGLRenderingContext | null

    let raf = 0
    let contextLost = false

    if (!gl) {
      /* WebGL not supported — container shows hero bg colour */
      return () => {
        if (container.contains(canvas)) container.removeChild(canvas)
      }
    }

    // If the browser force-loses this context (e.g. too many live WebGL
    // contexts after repeated refreshes), stop the loop instead of throwing.
    const onLost = (e: Event) => {
      e.preventDefault()
      contextLost = true
      cancelAnimationFrame(raf)
      raf = 0
    }
    canvas.addEventListener("webglcontextlost", onLost)

    /* ── Vertex shader: full-screen quad ───────────────────── */
    const VS = `attribute vec2 pos;void main(){gl_Position=vec4(pos,0.,1.);}`

    /* ── Fragment shader ────────────────────────────────────────
       Domain-warped FBM noise → contour isolines at 8 levels
       Background : near-white  vec3(0.960, 0.955, 0.945)
       Lines      : warm gray   vec3(0.72,  0.70,  0.68) @ 90%  */
    const FS = `
      precision highp float;
      uniform float u_t;
      uniform vec2  u_r;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}

      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
        return mix(mix(hash(i),         hash(i+vec2(1,0)),u.x),
                   mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
      }

      float fbm(vec2 p){
        float v=0.,a=.52;
        for(int i=0;i<4;i++){v+=a*noise(p);p*=2.1;a*=.48;}
        return v;
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / u_r;
        vec2 p  = vec2(uv.x*(u_r.x/u_r.y), uv.y);
        float t = u_t * 0.3;

        /* Two-pass domain warp — creates organic liquid flow */
        vec2 q = vec2(
          fbm(p + vec2(0.0,0.0) + t*0.3),
          fbm(p + vec2(3.7,1.9) + t*0.3)
        );
        float f = fbm(p*1.2 + 1.8*q + t*0.15);

        /* Isolines at 8 evenly-spaced threshold levels */
        float lv   = fract(f * 8.0);
        float dl   = min(lv, 1.0 - lv);
        float line = 1.0 - smoothstep(0.0, 0.018, dl);

        vec3 bg  = vec3(0.960, 0.955, 0.945);
        vec3 lc  = vec3(0.72,  0.70,  0.68);
        vec3 col = mix(bg, lc, line * 0.9);

        gl_FragColor = vec4(col, 1.0);
      }
    `

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s, src)
      gl!.compileShader(s)
      return s
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, 1,-1, 1,1, -1,1]),
      gl.STATIC_DRAW
    )

    const pl = gl.getAttribLocation(prog, "pos")
    const tl = gl.getUniformLocation(prog, "u_t")
    const rl = gl.getUniformLocation(prog, "u_r")
    gl.enableVertexAttribArray(pl)
    gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0)

    const start = Date.now()

    // Render at a reduced internal resolution and let the canvas's CSS
    // size upscale it — the pattern is soft/blurred by nature.
    const RENDER_SCALE = 0.8

    const resize = () => {
      canvas.width  = Math.round(window.innerWidth * RENDER_SCALE)
      canvas.height = Math.round(window.innerHeight * RENDER_SCALE)
      gl!.viewport(0, 0, canvas.width, canvas.height)
    }

    const render = () => {
      if (contextLost || gl!.isContextLost()) return
      gl!.clearColor(0.960, 0.955, 0.945, 1.0)
      gl!.clear(gl!.COLOR_BUFFER_BIT)
      gl!.uniform1f(tl, (Date.now() - start) / 1000)
      gl!.uniform2f(rl, canvas.width, canvas.height)
      gl!.drawArrays(gl!.TRIANGLES, 0, 6)
      raf = requestAnimationFrame(render)
    }

    resize()
    render()
    window.addEventListener("resize", resize)

    // Pause this WebGL loop when the hero scrolls off-screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!raf) raf = requestAnimationFrame(render)
        } else if (raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { threshold: 0 }
    )
    observer.observe(container)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("webglcontextlost", onLost)
      observer.disconnect()
      // Explicitly release the GPU context so repeated mounts / page
      // refreshes don't pile up contexts and hit the browser's limit.
      if (!gl.isContextLost()) {
        gl.getExtension("WEBGL_lose_context")?.loseContext()
      }
      if (container.contains(canvas)) container.removeChild(canvas)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0 }}
    />
  )
}
