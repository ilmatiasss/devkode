"use client";

import { useEffect, useRef } from "react";

// Globo de puntos que gira lentamente. Dos hebras naranjas lo recorren de polo a polo
// enroscándose como una doble hélice de ADN, unidas por travesaños. La torsión "respira"
// con el tiempo, así que la hélice se aprieta y se afloja.

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const CAMERA = 3;
const TILT = -0.42; // inclinación del eje, en radianes
const RUNGS = 15;

type Cloud = { lon: Float32Array; y: Float32Array; r: Float32Array; count: number };

// Puntos repartidos parejo sobre la esfera (espiral de Fibonacci)
function sphere(count: number): Cloud {
  const lon = new Float32Array(count);
  const y = new Float32Array(count);
  const r = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const yi = 1 - (2 * (i + 0.5)) / count;
    y[i] = yi;
    r[i] = Math.sqrt(1 - yi * yi);
    lon[i] = (i * GOLDEN) % (Math.PI * 2);
  }
  return { lon, y, r, count };
}

// Una hebra: puntos a lo largo de un meridiano, de polo a polo
function strand(count: number, offset: number): Cloud {
  const lon = new Float32Array(count);
  const y = new Float32Array(count);
  const r = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const yi = 0.97 - (1.94 * i) / (count - 1);
    y[i] = yi;
    r[i] = Math.sqrt(1 - yi * yi);
    lon[i] = offset;
  }
  return { lon, y, r, count };
}

export function DotGlobe({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    const parent = canvas?.parentElement;
    if (!canvas || !ctx || !parent) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let radius = 0;
    let dim = 1;
    let dots = sphere(1200);
    let strandA = strand(110, 0);
    let strandB = strand(110, Math.PI);

    // Seguimiento suave del puntero: inclina un poco el globo
    let targetX = 0;
    let targetY = 0;
    let px = 0;
    let py = 0;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const wide = w >= 1024;
      cx = w * (wide ? 0.66 : 0.5);
      cy = h * (wide ? 0.5 : 0.3);
      radius = wide ? Math.min(h * 0.5, w * 0.34) : Math.min(w * 0.46, h * 0.28);
      // En pantallas chicas el globo queda detrás del texto: más tenue
      dim = wide ? 1 : 0.55;

      const small = w < 640;
      dots = sphere(small ? 750 : 1900);
      strandA = strand(small ? 70 : 110, 0);
      strandB = strand(small ? 70 : 110, Math.PI);
    };

    const frame = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      const spin = t * 0.00012 + 0.6 + px * 0.35;
      const twist = 3.2 + 0.9 * Math.sin(t * 0.00042);
      const tilt = TILT + py * 0.14;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);

      // Devuelve [x, y, profundidad 0..1] en pantalla
      const out: [number, number, number] = [0, 0, 0];
      const project = (lon: number, y: number, r: number) => {
        const l = lon + spin + y * twist;
        const x3 = r * Math.cos(l);
        const z3 = r * Math.sin(l);
        const y2 = y * cosT - z3 * sinT;
        const z2 = y * sinT + z3 * cosT;
        const s = CAMERA / (CAMERA - z2 * 0.9);
        out[0] = cx + x3 * radius * s;
        out[1] = cy - y2 * radius * s;
        out[2] = (z2 + 1) / 2;
      };

      // 1. Puntos del globo
      ctx.fillStyle = "rgb(226, 229, 235)";
      for (let i = 0; i < dots.count; i++) {
        project(dots.lon[i], dots.y[i], dots.r[i]);
        const d = out[2];
        ctx.globalAlpha = (0.14 + 0.62 * d * d) * dim;
        ctx.beginPath();
        ctx.arc(out[0], out[1], 0.55 + 0.95 * d, 0, 6.2832);
        ctx.fill();
      }

      // 2. Travesaños entre las dos hebras
      ctx.strokeStyle = "rgb(255, 150, 105)";
      ctx.lineWidth = 1;
      for (let k = 0; k < RUNGS; k++) {
        const y = -0.9 + (1.8 * k) / (RUNGS - 1);
        const r = Math.sqrt(1 - y * y);
        project(0, y, r);
        const ax = out[0];
        const ay = out[1];
        const da = out[2];
        project(Math.PI, y, r);
        ctx.globalAlpha = (0.025 + 0.2 * ((da + out[2]) / 2)) * dim;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(out[0], out[1]);
        ctx.stroke();
      }

      // 3. Las dos hebras
      ctx.fillStyle = "rgb(255, 90, 31)";
      for (const s of [strandA, strandB]) {
        for (let i = 0; i < s.count; i++) {
          project(s.lon[i], s.y[i], s.r[i]);
          const d = out[2];
          ctx.globalAlpha = (0.22 + 0.78 * d) * Math.min(1, dim + 0.2);
          ctx.beginPath();
          ctx.arc(out[0], out[1], 0.9 + 1.6 * d, 0, 6.2832);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    const loop = (t: number) => {
      px += (targetX - px) * 0.04;
      py += (targetY - py) * 0.04;
      frame(t);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && !reduceMotion) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    layout();
    frame(reduceMotion ? 9000 : 0);

    const resize = new ResizeObserver(() => {
      layout();
      if (reduceMotion) frame(9000);
    });
    resize.observe(parent);

    // Solo se anima mientras la portada está a la vista
    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    visibility.observe(canvas);

    const onPointer = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduceMotion) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      stop();
      resize.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
