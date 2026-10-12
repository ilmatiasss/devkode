"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Project } from "@/content/site";

// Los proyectos forman un anillo que gira muy lento. El de adelante se muestra en el panel.
// De fondo, cada proyecto arrastra una estela de puntos de su color. Al pasar el mouse o
// enfocar con el teclado el giro se detiene; al hacer clic en un logo, ese proyecto pasa al frente.

const TAU = Math.PI * 2;
const SPEED = TAU / 54000; // una vuelta cada 54 segundos
const RX = 0.4; // radio horizontal del recorrido, como fracción del ancho
const RY = 0.2; // radio vertical (inclina la órbita), como fracción del alto
const CENTER_Y = 0.5;
const TAIL = 2.05; // largo de la estela, en radianes
const HOLD = 12000; // tras un clic, el anillo se queda quieto este tiempo (ms)

// Generador pseudoaleatorio con semilla: la nube de puntos es siempre la misma
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Cloud = { delta: Float32Array; rho: Float32Array; lift: Float32Array; size: Float32Array };

function makeCloud(count: number, seed: number): Cloud {
  const rand = seeded(seed);
  const normal = () => (rand() + rand() + rand() + rand() - 2) / 0.58; // ~ N(0, 1)
  const cloud: Cloud = {
    delta: new Float32Array(count),
    rho: new Float32Array(count),
    lift: new Float32Array(count),
    size: new Float32Array(count),
  };
  for (let i = 0; i < count; i++) {
    cloud.delta[i] = -TAIL * Math.pow(rand(), 1.5) + 0.18 * rand(); // más densa cerca del logo
    cloud.rho[i] = normal() * 0.075;
    cloud.lift[i] = normal() * 0.2;
    cloud.size[i] = 0.9 + rand() * 1.5;
  }
  return cloud;
}

function tileStyle(index: number, angle: number, step: number): CSSProperties {
  const theta = angle + index * step;
  const z = Math.cos(theta);
  const d = (z + 1) / 2;
  return {
    left: `${((0.5 + RX * Math.sin(theta)) * 100).toFixed(2)}%`,
    top: `${((CENTER_Y + RY * z) * 100).toFixed(2)}%`,
    transform: `translate(-50%, -50%) scale(${(0.6 + 0.4 * d).toFixed(3)})`,
    opacity: Number((0.4 + 0.6 * d).toFixed(3)),
    zIndex: Math.round(d * 10),
  };
}

export function ProjectOrbit({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const selectRef = useRef<(index: number) => void>(() => {});

  const count = projects.length;
  const step = TAU / count;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const root = rootRef.current;
    const stage = canvas?.parentElement;
    if (!canvas || !ctx || !root || !stage) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let angle = 0;
    let target: number | null = null;
    let selected: number | null = null;
    let pausedUntil = 0;
    let hovering = false;
    let focused = false;
    let current = 0;
    let last = performance.now();
    let arms: Cloud[] = [];
    let ambient = makeCloud(0, 1);

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = stage.clientWidth;
      h = stage.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const perArm = w < 640 ? 260 : 520;
      arms = projects.map((_, i) => makeCloud(perArm, 101 + i * 17));
      ambient = makeCloud(w < 640 ? 160 : 320, 7);
    };

    // Convierte una posición del anillo (ángulo, radio, altura) en coordenadas de pantalla
    const out = { x: 0, y: 0, d: 0 };
    const place = (theta: number, r: number, lift: number) => {
      const z = r * Math.cos(theta);
      out.x = (0.5 + RX * r * Math.sin(theta)) * w;
      out.y = (CENTER_Y + RY * z - 0.22 * lift) * h;
      out.d = Math.max(0, Math.min(1, (z + 1) / 2));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Puntos sueltos de fondo, giran al revés y más lento que el anillo.
      // Reparten los colores de los tres proyectos, con algunos blancos.
      for (let k = 0; k < ambient.delta.length; k++) {
        ctx.fillStyle = k % 4 === 3 ? "rgb(226, 229, 235)" : projects[k % count].color;
        const theta = -angle * 0.35 + (ambient.delta[k] / TAIL) * Math.PI * 1.15 + k * 2.399;
        const r = 0.25 + (k % 9) * 0.17 + (ambient.rho[k] / 0.075) * 0.1;
        place(theta, Math.abs(r), ambient.lift[k] * 4);
        ctx.globalAlpha = 0.12 + 0.4 * out.d;
        ctx.beginPath();
        ctx.arc(out.x, out.y, 0.5 + ambient.size[k] * 0.5 * (0.5 + out.d), 0, TAU);
        ctx.fill();
      }

      // Estela de cada proyecto, en su color
      projects.forEach((project, p) => {
        const cloud = arms[p];
        if (!cloud) return;
        ctx.fillStyle = project.color;
        for (let k = 0; k < cloud.delta.length; k++) {
          const delta = cloud.delta[k];
          place(angle + p * step + delta, 1 + cloud.rho[k], cloud.lift[k]);
          const fade = Math.max(0.12, 1 + delta / TAIL);
          ctx.globalAlpha = (0.16 + 0.8 * out.d * out.d) * fade;
          ctx.beginPath();
          ctx.arc(out.x, out.y, cloud.size[k] * (0.6 + 0.9 * out.d), 0, TAU);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
    };

    const render = (now: number) => {
      for (let i = 0; i < count; i++) {
        const tile = tiles.current[i];
        if (tile) Object.assign(tile.style, tileStyle(i, angle, step));
      }
      draw();

      // Proyecto activo: el que se eligió con un clic o, si no, el que está más al frente
      if (selected !== null && now >= pausedUntil) selected = null;
      let front = 0;
      let bestZ = -2;
      for (let i = 0; i < count; i++) {
        const z = Math.cos(angle + i * step);
        if (z > bestZ) {
          bestZ = z;
          front = i;
        }
      }
      const index = selected ?? front;
      if (index !== current) {
        current = index;
        setActive(index);
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      const paused = hovering || focused || now < pausedUntil;

      if (target !== null) {
        // Lleva el anillo al ángulo pedido por el camino más corto
        const delta = ((((target - angle + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
        angle += delta * Math.min(1, dt * 0.006);
        if (Math.abs(delta) < 0.002) {
          angle = target;
          target = null;
        }
      } else if (!paused) {
        angle += SPEED * dt;
      }
      angle = ((angle % TAU) + TAU) % TAU;
      render(now);
      raf = requestAnimationFrame(frame);
    };

    let raf = 0;
    const start = () => {
      if (raf || reduceMotion) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    selectRef.current = (index: number) => {
      selected = index;
      pausedUntil = performance.now() + HOLD;
      const goal = (((-index * step) % TAU) + TAU) % TAU;
      if (reduceMotion) {
        angle = goal;
        render(performance.now());
      } else {
        target = goal;
      }
    };

    layout();
    render(performance.now());

    const onEnter = () => (hovering = true);
    const onLeave = () => (hovering = false);
    const onFocusIn = () => (focused = true);
    const onFocusOut = () => (focused = false);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);

    const resize = new ResizeObserver(() => {
      layout();
      render(performance.now());
    });
    resize.observe(stage);

    // Solo gira mientras la sección está a la vista
    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    visibility.observe(root);

    return () => {
      stop();
      resize.disconnect();
      visibility.disconnect();
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
    // El anillo se arma una sola vez con los proyectos recibidos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
      <div>
        <div className="relative h-[330px] sm:h-[400px] lg:h-[460px]">
          <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
          {projects.map((project, i) => {
            const isActive = i === active;
            return (
              <button
                key={project.name}
                ref={(el) => {
                  tiles.current[i] = el;
                }}
                type="button"
                aria-label={`Ver ${project.name}`}
                aria-pressed={isActive}
                aria-controls={`proyecto-${i}`}
                onClick={() => selectRef.current(i)}
                style={tileStyle(i, 0, step)}
                className="absolute w-[88px] will-change-transform sm:w-[112px] lg:w-[132px]"
              >
                <span
                  className="flex aspect-square items-center justify-center border bg-[#0b0c0f] transition-colors duration-500"
                  style={{ borderColor: isActive ? project.color : "var(--color-line)" }}
                >
                  {project.logo ? (
                    <Image
                      src={project.logo}
                      alt=""
                      sizes="132px"
                      className="h-auto w-auto max-w-[72%] object-contain"
                      style={{ maxHeight: project.logoMaxHeight ?? "72%" }}
                    />
                  ) : (
                    <span className="text-sm font-semibold">{project.name}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-center font-mono text-xs text-muted">Toca un proyecto para verlo</p>
      </div>

      {/* Los tres textos están siempre en la página; solo se ve el del proyecto activo */}
      <div className="grid">
        {projects.map((project, i) => {
          const isActive = i === active;
          return (
            <article
              key={project.name}
              id={`proyecto-${i}`}
              className={`[grid-area:1/1] ${
                isActive
                  ? "visible opacity-100 [transition:opacity_450ms_120ms,visibility_0s]"
                  : "invisible opacity-0 [transition:opacity_300ms,visibility_0s_300ms]"
              }`}
            >
              <span className="block h-1 w-14" style={{ background: project.color }} aria-hidden="true" />
              <p className="mt-6 flex flex-wrap items-center gap-x-3 font-mono text-xs text-muted">
                {project.kind}
                <span className="flex items-center gap-2">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: project.status ? "var(--color-accent)" : "currentColor" }}
                    aria-hidden="true"
                  />
                  <span className={project.status ? "text-accent" : undefined}>{project.status ?? "En línea"}</span>
                </span>
              </p>
              <h3 className="mt-3 text-[clamp(2.2rem,4.4vw,3.5rem)] font-medium leading-none tracking-[-0.03em]">
                {project.name}
              </h3>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">{project.description}</p>
              {project.href ? (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 font-mono text-sm underline decoration-line decoration-2 underline-offset-[6px] transition-colors hover:text-accent hover:decoration-accent"
                >
                  {project.domain} <span aria-hidden="true">↗</span>
                  <span className="sr-only">(se abre en una pestaña nueva)</span>
                </a>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
