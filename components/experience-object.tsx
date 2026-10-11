"use client";

import { useEffect, useRef } from "react";

/**
 * A solid obsidian ring beside the Experience column that splits into a shell
 * of glowing particles when the cursor comes near (or you click), scatters with
 * a cursor push and drift, then streams back and re-solidifies when the pointer
 * leaves. Two WebGL passes in one canvas: a raymarched torus that fades out as
 * it shatters, and a point cloud that fades in and scatters. Drag to spin it
 * with inertia; it also leans toward and drifts after the pointer. Paused off
 * screen, static under prefers-reduced-motion, desktop only.
 */
export function ExperienceObject() {
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    if (holder.clientWidth < 40) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;";
    holder.appendChild(canvas);

    const gl = (canvas.getContext("webgl", { antialias: true, alpha: true }) ??
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

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const link = (vs: string, fs: string) => {
      const p = gl.createProgram()!;
      gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      return p;
    };

    /* ---------- solid raymarched ring ---------- */
    const SOLID_VS = "attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.,1.);}";
    const SOLID_FS = [
      "precision highp float;",
      "uniform vec2 u_r; uniform vec2 u_m; uniform vec2 u_rot;",
      "uniform vec2 u_lean; uniform vec2 u_pos;",
      "uniform float u_hover; uniform float u_solidFade;",
      "mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}",
      "float sdf(vec3 p){",
      "  float k = 0.28 + u_hover*0.3;",
      "  float c=cos(k*p.y), s=sin(k*p.y);",
      "  p.xz = mat2(c,-s,s,c)*p.xz;",
      "  vec2 q = vec2(length(p.xz)-0.54, p.y);",
      "  return length(q) - 0.15;",
      "}",
      "vec3 nrm(vec3 p){",
      "  vec2 e=vec2(0.0013,0.0);",
      "  return normalize(vec3(",
      "    sdf(p+e.xyy)-sdf(p-e.xyy),",
      "    sdf(p+e.yxy)-sdf(p-e.yxy),",
      "    sdf(p+e.yyx)-sdf(p-e.yyx)));",
      "}",
      "void main(){",
      "  if(u_solidFade < 0.004) discard;",
      "  vec2 uv = (gl_FragCoord.xy - 0.5*u_r)/u_r.y;",
      "  vec3 bg = vec3(0.066,0.055,0.032);",
      "  vec3 acc = vec3(0.96,0.43,0.27);",
      "  mat2 Ry = rot(u_rot.y + u_lean.x);",
      "  mat2 Rx = rot(u_rot.x + u_lean.y);",
      "  vec3 ro = vec3(0.0,0.0,4.2);",
      "  vec3 rd = normalize(vec3(uv, -1.9));",
      "  float d=0.0; vec3 p; float hit=0.0;",
      "  for(int i=0;i<80;i++){",
      "    p = ro + rd*d;",
      "    vec3 pp = p; pp.xy -= u_pos; pp.xz = Ry*pp.xz; pp.yz = Rx*pp.yz;",
      "    float dist = sdf(pp);",
      "    if(dist < 0.001){ hit=1.0; break; }",
      "    d += dist; if(d > 9.0) break;",
      "  }",
      "  if(hit < 0.5) discard;",
      "  vec3 pp = p; pp.xy -= u_pos; pp.xz = Ry*pp.xz; pp.yz = Rx*pp.yz;",
      "  vec3 n = nrm(pp); vec3 v = normalize(-rd);",
      "  vec3 lig = normalize(vec3(-0.55 + u_m.x*0.7, 0.85, 0.55 + u_m.y*0.55));",
      "  float diff = max(dot(n,lig),0.0);",
      "  float spec = pow(max(dot(reflect(-lig,n),v),0.0), 46.0);",
      "  float fres = pow(1.0 - max(dot(n,v),0.0), 3.0);",
      "  vec3 col = bg + vec3(0.02) + vec3(0.15)*diff + acc*diff*0.13;",
      "  col += vec3(1.0,0.96,0.9) * spec * (1.25 + u_hover*0.8);",
      "  col += acc * fres * (0.52 + u_hover*0.55);",
      "  col *= 0.88 + 0.14*n.y;",
      "  float vig = smoothstep(1.2, 0.1, length(uv));",
      "  float A = clamp((0.72 + vig*0.28) * u_solidFade, 0.0, 1.0);",
      "  gl_FragColor = vec4(col * A, A);",
      "}",
    ].join("\n");
    const progSolid = link(SOLID_VS, SOLID_FS);
    const aPos = gl.getAttribLocation(progSolid, "aPos");
    const sU = {
      r: gl.getUniformLocation(progSolid, "u_r"),
      m: gl.getUniformLocation(progSolid, "u_m"),
      rot: gl.getUniformLocation(progSolid, "u_rot"),
      lean: gl.getUniformLocation(progSolid, "u_lean"),
      pos: gl.getUniformLocation(progSolid, "u_pos"),
      hover: gl.getUniformLocation(progSolid, "u_hover"),
      fade: gl.getUniformLocation(progSolid, "u_solidFade"),
    };
    const triBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    /* ---------- particle shell ---------- */
    const NU = 96;
    const NV = 26;
    const N = NU * NV;
    const R = 0.54;
    const TR = 0.15;
    const aRest = new Float32Array(N * 3);
    const aNorm = new Float32Array(N * 3);
    const aDir = new Float32Array(N * 3);
    const aRnd = new Float32Array(N);
    let k = 0;
    for (let i = 0; i < NU; i++) {
      for (let j = 0; j < NV; j++) {
        const u = (2 * Math.PI * (i + Math.random() * 0.7)) / NU;
        const v = (2 * Math.PI * (j + Math.random() * 0.7)) / NV;
        const cu = Math.cos(u);
        const su = Math.sin(u);
        const cv = Math.cos(v);
        const sv = Math.sin(v);
        const rr = R + TR * cv;
        const o = k * 3;
        aRest[o] = rr * cu;
        aRest[o + 1] = TR * sv;
        aRest[o + 2] = rr * su;
        aNorm[o] = cv * cu;
        aNorm[o + 1] = sv;
        aNorm[o + 2] = cv * su;
        let dx = aNorm[o] * 0.55 + (Math.random() * 2 - 1) * 0.9;
        let dy = aNorm[o + 1] * 0.55 + (Math.random() * 2 - 1) * 0.9;
        let dz = aNorm[o + 2] * 0.55 + (Math.random() * 2 - 1) * 0.9;
        const dl = Math.hypot(dx, dy, dz) || 1;
        aDir[o] = dx / dl;
        aDir[o + 1] = dy / dl;
        aDir[o + 2] = dz / dl;
        aRnd[k] = Math.random();
        k++;
      }
    }

    const PT_VS = [
      "precision highp float;",
      "attribute vec3 aRest; attribute vec3 aNorm; attribute vec3 aDir;",
      "attribute float aRand;",
      "uniform vec2 u_r; uniform float u_time; uniform float u_pscale;",
      "uniform vec2 u_rot; uniform vec2 u_lean; uniform vec2 u_pos;",
      "uniform vec2 u_cursor; uniform float u_hover; uniform float u_shatter;",
      "varying float vGlow; varying float vFade;",
      "void main(){",
      "  vec3 pos = aRest; vec3 nrm = aNorm;",
      "  float s = clamp(u_shatter*1.35 - aRand*0.5, 0.0, 1.0);",
      "  s = s*s*(3.0-2.0*s);",
      "  float dist = s * (0.55 + aRand*1.25);",
      "  vec3 drift = vec3(",
      "    sin(u_time*0.8 + aRand*41.0),",
      "    cos(u_time*0.7 + aRand*33.0),",
      "    sin(u_time*0.6 + aRand*27.0)) * s * 0.13;",
      "  pos += aDir * dist + drift;",
      "  float ry = u_rot.y + u_lean.x;",
      "  float rx = u_rot.x + u_lean.y;",
      "  float cy = cos(ry), sy = sin(ry);",
      "  float cx = cos(rx), sx = sin(rx);",
      "  pos.xz = mat2(cy,-sy,sy,cy) * pos.xz;",
      "  pos.yz = mat2(cx,-sx,sx,cx) * pos.yz;",
      "  nrm.xz = mat2(cy,-sy,sy,cy) * nrm.xz;",
      "  nrm.yz = mat2(cx,-sx,sx,cx) * nrm.yz;",
      "  pos.xy += u_pos;",
      "  vec2 toC = pos.xy - u_cursor;",
      "  float cd = length(toC);",
      "  pos.xy += normalize(toC + 0.0001) * (u_hover * exp(-cd*cd*3.2) * 0.4);",
      "  vec3 rel = pos - vec3(0.0,0.0,4.2);",
      "  vec2 screen = (rel.xy / (-rel.z)) * 1.9;",
      "  vec2 clip = screen * vec2(2.0 * u_r.y / u_r.x, 2.0);",
      "  gl_Position = vec4(clip, 0.0, 1.0);",
      "  gl_PointSize = clamp((14.0 / (-rel.z)) * u_pscale * (1.0 + s*0.35), 1.5, 9.0);",
      "  float lit = max(dot(normalize(nrm), normalize(vec3(-0.5,0.8,0.5))), 0.0);",
      "  vGlow = 0.16 + lit*0.5 + u_hover*0.28 + s*0.12;",
      "  vFade = smoothstep(0.02, 0.42, u_shatter);",
      "}",
    ].join("\n");
    const PT_FS = [
      "precision highp float;",
      "varying float vGlow; varying float vFade;",
      "void main(){",
      "  float d = length(gl_PointCoord - 0.5);",
      "  if(d > 0.5) discard;",
      "  float a = smoothstep(0.5, 0.06, d);",
      "  vec3 c = mix(vec3(0.64,0.45,0.3), vec3(1.0,0.56,0.36), clamp(vGlow,0.0,1.0));",
      "  float g = a * (0.28 + vGlow*0.32) * vFade;",
      "  gl_FragColor = vec4(c * g, g);",
      "}",
    ].join("\n");
    const progPts = link(PT_VS, PT_FS);
    const pAttrs = [
      { name: "aRest", data: aRest, size: 3 },
      { name: "aNorm", data: aNorm, size: 3 },
      { name: "aDir", data: aDir, size: 3 },
      { name: "aRand", data: aRnd, size: 1 },
    ].map((a) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, a.data, gl.STATIC_DRAW);
      return { buf, loc: gl.getAttribLocation(progPts, a.name), size: a.size };
    });
    const pU = {
      r: gl.getUniformLocation(progPts, "u_r"),
      time: gl.getUniformLocation(progPts, "u_time"),
      pscale: gl.getUniformLocation(progPts, "u_pscale"),
      rot: gl.getUniformLocation(progPts, "u_rot"),
      lean: gl.getUniformLocation(progPts, "u_lean"),
      pos: gl.getUniformLocation(progPts, "u_pos"),
      cursor: gl.getUniformLocation(progPts, "u_cursor"),
      hover: gl.getUniformLocation(progPts, "u_hover"),
      shatter: gl.getUniformLocation(progPts, "u_shatter"),
    };

    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    const SCALE = Math.min(window.devicePixelRatio || 1, 2) * 0.85;
    let W = 1;
    let H = 1;
    let pscale = SCALE;
    const resize = () => {
      W = Math.max(1, Math.round(holder.clientWidth * SCALE));
      H = Math.max(1, Math.round(holder.clientHeight * SCALE));
      canvas.width = W;
      canvas.height = H;
      gl.viewport(0, 0, W, H);
      pscale = W / Math.max(1, holder.clientWidth);
      if (reduce) frame();
    };

    /* ---------- interaction state ---------- */
    let rotX = -0.36;
    let rotY = 0.4;
    let velX = 0;
    let velY = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const m = { x: 0, y: 0 };
    const mt = { x: 0, y: 0 };
    const cur = { x: 99, y: 99 };
    let hover = 0;
    let hoverT = 0;
    let burst = 0;
    let shatter = 0;
    const lean = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const sstep = (a: number, b: number, x: number) => {
      const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };

    const setFromEvent = (e: PointerEvent) => {
      const r = holder.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      mt.x = nx * 2 - 1;
      mt.y = -(ny * 2 - 1);
      const asp = r.width / Math.max(1, r.height);
      cur.x = (nx - 0.5) * asp * 1.95;
      cur.y = (0.5 - ny) * 1.95;
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      hoverT = 1;
      burst = 1;
      lastX = e.clientX;
      lastY = e.clientY;
      try {
        holder.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      try {
        holder.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    const onMove = (e: PointerEvent) => {
      setFromEvent(e);
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        velY = dx * 0.006;
        velX = dy * 0.006;
        rotY += velY;
        rotX += velX;
      }
    };
    const onEnter = () => (hoverT = 1);
    const onLeave = () => {
      if (!dragging) hoverT = 0;
      cur.x = 99;
      cur.y = 99;
    };

    holder.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove, { passive: true });
    holder.addEventListener("pointerenter", onEnter);
    holder.addEventListener("pointerleave", onLeave);

    const start = Date.now();
    const frame = () => {
      if (contextLost || gl.isContextLost()) return;

      if (!reduce) {
        m.x += (mt.x - m.x) * 0.08;
        m.y += (mt.y - m.y) * 0.08;
        hover += (hoverT - hover) * 0.08;
        burst *= 0.93;
        const shT = Math.min(1, hover * 0.9 + burst);
        shatter += (shT - shatter) * 0.05;

        const cx = Math.max(-1.1, Math.min(1.1, m.x));
        const cy = Math.max(-1.1, Math.min(1.1, m.y));
        lean.x += (cx * 0.34 * hover - lean.x) * 0.09;
        lean.y += (cy * 0.24 * hover - lean.y) * 0.09;
        pos.x += (cx * 0.32 * hover - pos.x) * 0.08;
        pos.y += (cy * 0.4 * hover - pos.y) * 0.08;

        if (!dragging) {
          rotY += velY;
          rotX += velX;
          velY *= 0.94;
          velX *= 0.94;
          rotY += 0.004;
          rotX += (-0.34 - rotX) * 0.01;
        }
      }

      const solidFade = Math.max(0, 1 - sstep(0, 0.32, shatter));

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // pass 1 — solid ring (premultiplied, over)
      gl.useProgram(progSolid);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      for (const a of pAttrs) gl.disableVertexAttribArray(a.loc);
      gl.bindBuffer(gl.ARRAY_BUFFER, triBuf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(sU.r, W, H);
      gl.uniform2f(sU.m, m.x, m.y);
      gl.uniform2f(sU.rot, rotX, rotY);
      gl.uniform2f(sU.lean, lean.x, lean.y);
      gl.uniform2f(sU.pos, pos.x, pos.y);
      gl.uniform1f(sU.hover, hover);
      gl.uniform1f(sU.fade, solidFade);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // pass 2 — particle shell (premultiplied, additive)
      gl.useProgram(progPts);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.disableVertexAttribArray(aPos);
      for (const a of pAttrs) {
        gl.bindBuffer(gl.ARRAY_BUFFER, a.buf);
        gl.enableVertexAttribArray(a.loc);
        gl.vertexAttribPointer(a.loc, a.size, gl.FLOAT, false, 0, 0);
      }
      gl.uniform2f(pU.r, W, H);
      gl.uniform1f(pU.time, (Date.now() - start) / 1000);
      gl.uniform1f(pU.pscale, pscale);
      gl.uniform2f(pU.rot, rotX, rotY);
      gl.uniform2f(pU.lean, lean.x, lean.y);
      gl.uniform2f(pU.pos, pos.x, pos.y);
      gl.uniform2f(pU.cursor, cur.x, cur.y);
      gl.uniform1f(pU.hover, hover);
      gl.uniform1f(pU.shatter, reduce ? 0 : shatter);
      gl.drawArrays(gl.POINTS, 0, N);
    };
    const loop = () => {
      frame();
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      holder.removeEventListener("pointerdown", onDown);
      holder.removeEventListener("pointerenter", onEnter);
      holder.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      if (!gl.isContextLost()) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
      if (holder.contains(canvas)) holder.removeChild(canvas);
    };

    if (reduce) {
      frame();
      return cleanup;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!raf && !contextLost) raf = requestAnimationFrame(loop);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 },
    );
    io.observe(holder);
    return () => {
      io.disconnect();
      cleanup();
    };
  }, []);

  return (
    <div
      ref={holderRef}
      aria-hidden
      className="relative mx-auto aspect-[4/5] w-full max-w-[22rem] cursor-grab touch-none active:cursor-grabbing"
    />
  );
}
