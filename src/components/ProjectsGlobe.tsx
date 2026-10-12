"use client";

import { useEffect, useRef } from "react";
import { sphere, strand } from "@/lib/dots";

// Globo de puntos que gira lento detrás de los proyectos, como el de la portada pero
// estirado para cubrir los tres. Los puntos toman el color de cada proyecto según su
// posición en pantalla: de izquierda a derecha en escritorio y de arriba abajo en celular,
// en el mismo orden en que aparecen los proyectos. Las dos hebras de ADN también se tiñen.

const CAMERA = 3;
const TILT = -0.35;
const STEPS = 64; // tonos precalculados de la mezcla de colores

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

// Mezcla suave entre los colores de los proyectos, como lista de textos "rgb(...)"
function makePalette(colors: string[]): string[] {
  const stops = colors.map(hexToRgb);
  const palette: string[] = [];
  for (let i = 0; i < STEPS; i++) {
    const t = (i / (STEPS - 1)) * (stops.length - 1);
    const from = Math.min(Math.floor(t), stops.length - 2);
    const f = t - from;
    const k = f * f * (3 - 2 * f); // suaviza el cambio entre un color y el siguiente
    const [r, g, b] = stops[from].map((c, j) => Math.round(c + (stops[from + 1][j] - c) * k));
    palette.push(`rgb(${r}, ${g}, ${b})`);
  }
  return palette;
}

export function ProjectsGlobe({ colors, className = "" }: { colors: string[]; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || colors.length < 2) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = makePalette(colors);

    let w = 0;
    let h = 0;
    let rx = 0;
    let ry = 0;
    let vertical = false;
    let dots = sphere(1000);
    let strandA = strand(80, 0);
    let strandB = strand(80, Math.PI);

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Un óvalo que cubre toda la sección. En celular los proyectos van uno bajo otro,
      // así que los colores se reparten de arriba hacia abajo.
      vertical = w < 768;
      rx = w * 0.5;
      ry = h * 0.5;

      const gap = vertical ? 12 : 13;
      dots = sphere(Math.min(4200, Math.round((2 * Math.PI * rx * ry) / (gap * gap))));
      const hebra = Math.max(70, Math.min(180, Math.round(Math.max(rx, ry) / 3.5)));
      strandA = strand(hebra, 0);
      strandB = strand(hebra, Math.PI);
    };

    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);
    const out = { x: 0, y: 0, d: 0, tone: "" };

    // Proyecta un punto de la esfera a pantalla y calcula su tono según su posición
    const project = (lon: number, y: number, r: number, spin: number, twist: number) => {
      const l = lon + spin + y * twist;
      const x3 = r * Math.cos(l);
      const z3 = r * Math.sin(l);
      const y2 = y * cosT - z3 * sinT;
      const z2 = y * sinT + z3 * cosT;
      const s = CAMERA / (CAMERA - z2 * 0.9);
      out.x = w / 2 + x3 * rx * s;
      out.y = h / 2 - y2 * ry * s;
      out.d = (z2 + 1) / 2;
      // Cada color queda centrado detrás de su proyecto (los centros de las tres columnas o filas
      // están más o menos al 17 %, 50 % y 83 %); el 1.6 acorta la zona donde se mezclan.
      const t = vertical ? out.y / h : out.x / w;
      const tone = Math.max(0, Math.min(1, 0.5 + (t - 0.5) * 1.6));
      out.tone = palette[Math.round(tone * (STEPS - 1))];
    };

    const frame = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const spin = time * 0.0001 + 0.8;
      const twist = 2.6 + 0.8 * Math.sin(time * 0.0004);

      for (let i = 0; i < dots.count; i++) {
        project(dots.lon[i], dots.y[i], dots.r[i], spin, twist);
        const d = out.d;
        ctx.fillStyle = out.tone;
        ctx.globalAlpha = 0.2 + 0.65 * d * d;
        ctx.beginPath();
        ctx.arc(out.x, out.y, 0.65 + 1.1 * d, 0, 6.2832);
        ctx.fill();
      }

      for (const s of [strandA, strandB]) {
        for (let i = 0; i < s.count; i++) {
          project(s.lon[i], s.y[i], s.r[i], spin, twist);
          const d = out.d;
          ctx.fillStyle = out.tone;
          ctx.globalAlpha = 0.35 + 0.65 * d;
          ctx.beginPath();
          ctx.arc(out.x, out.y, 1.1 + 1.9 * d, 0, 6.2832);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    const loop = (t: number) => {
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
    resize.observe(canvas);

    // Solo se anima mientras la sección está a la vista
    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    visibility.observe(canvas);

    return () => {
      stop();
      resize.disconnect();
      visibility.disconnect();
    };
    // Los colores se leen una sola vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
