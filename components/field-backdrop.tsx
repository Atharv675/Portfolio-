"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient WebGL depth behind the Selected Work section: a dark, slow,
 * domain-warped contour field with a faked horizon so it reads as receding 3D
 * space, plus a warm glow that trails the cursor. Raw GLSL (no library, matching
 * the hero's approach), rendered at a low internal resolution, paused when the
 * section is off screen, and skipped on small screens and under
 * prefers-reduced-motion. It stays very low-contrast so the copy on top is
 * always the focus.
 */
export function FieldBackdrop() {
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 900) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;";
    holder.appendChild(canvas);

    const gl = (canvas.getContext("webgl", { antialias: false, alpha: false }) ??
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) {
      holder.removeChild(canvas);
      return;
    }

    let raf = 0;
    let contextLost = false;
    const onLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    canvas.addEventListener("webglcontextlost", onLost);

    const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    const FS = [
      "precision highp float;",
      "uniform vec2 u_r; uniform float u_t; uniform vec2 u_m;",
      "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
      "float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);",
      " return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}",
      "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}",
      "void main(){",
      "  vec2 uv = gl_FragCoord.xy / u_r;",
      "  float asp = u_r.x / u_r.y;",
      "  vec2 p = vec2(uv.x*asp, uv.y);",
      "  float depth = 1.0 - uv.y;",
      "  p.y = p.y / (0.32 + depth*1.5);",          // fake horizon -> recession
      "  p *= 2.3;",
      "  float t = u_t * 0.045;",
      "  float ca = cos(t*0.4), sa = sin(t*0.4);",
      "  p = mat2(ca,-sa,sa,ca) * p;",
      "  vec2 q = vec2(fbm(p + t), fbm(p + vec2(3.2,1.7) - t));",
      "  float f = fbm(p*1.3 + 1.7*q + t*0.5);",
      "  float lv = fract(f*6.0); float dl = min(lv, 1.0-lv);",
      "  float line = 1.0 - smoothstep(0.0, 0.032, dl);",
      "  vec2 m = vec2(u_m.x*asp, u_m.y);",
      "  vec2 fp = vec2(uv.x*asp, uv.y);",
      "  float mg = exp(-dot(fp-m, fp-m) * 7.0);",
      "  vec3 base = vec3(0.074, 0.061, 0.035);",
      "  vec3 hi   = vec3(0.16, 0.128, 0.088);",
      "  vec3 acc  = vec3(0.886, 0.329, 0.184);",
      "  vec3 col = mix(base, hi, smoothstep(0.34, 0.86, f) * (0.45 + depth*0.55));",
      "  col = mix(col, acc, line * 0.045 + mg * 0.09 * smoothstep(0.5, 0.9, f));",
      "  col += acc * mg * 0.035;",
      "  float vig = smoothstep(1.15, 0.22, length(uv - 0.5));",
      "  col = mix(base, col, 0.18 + vig*0.82);",
      "  gl_FragColor = vec4(col, 1.0);",
      "}",
    ].join("\n");

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const pl = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(pl);
    gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(prog, "u_r");
    const uT = gl.getUniformLocation(prog, "u_t");
    const uM = gl.getUniformLocation(prog, "u_m");

    const SCALE = 0.62;
    let W = 1;
    let H = 1;
    const resize = () => {
      W = Math.max(1, Math.round(Math.min(holder.clientWidth, 1600) * SCALE));
      H = Math.max(1, Math.round(Math.min(holder.clientHeight, 1400) * SCALE));
      canvas.width = W;
      canvas.height = H;
      gl.viewport(0, 0, W, H);
    };

    const mouse = { x: 0.5, y: 0.6 };
    const target = { x: 0.5, y: 0.6 };
    const onMove = (e: PointerEvent) => {
      const r = holder.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const start = Date.now();
    const render = () => {
      if (contextLost || gl.isContextLost()) return;
      mouse.x += (target.x - mouse.x) * 0.05;
      mouse.y += (target.y - mouse.y) * 0.05;
      gl.uniform2f(uR, W, H);
      gl.uniform1f(uT, (Date.now() - start) / 1000);
      gl.uniform2f(uM, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize, { passive: true });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!raf && !contextLost) raf = requestAnimationFrame(render);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 },
    );
    io.observe(holder);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("webglcontextlost", onLost);
      if (!gl.isContextLost()) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
      if (holder.contains(canvas)) holder.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={holderRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
    />
  );
}
