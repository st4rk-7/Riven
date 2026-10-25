import { useEffect, useRef } from "react";

// Dot lattice that lights up around the pointer: nearby dots gain "energy", neighbours are joined
// by lines (right, down, both diagonals), and energy decays each frame so the shape leaves a trail.
const GAP = 42;
const RADIUS = 110;
const DECAY = 0.93;

export function DotGrid({ className = "" }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    const host = cv?.parentElement;
    const ctx = cv?.getContext("2d");
    if (!cv || !host || !ctx) return;

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cols = 0, rows = 0, energy = new Float32Array(0), raf = 0, ox = 0, oy = 0;

    const resize = () => {
      const dpr = devicePixelRatio || 1;
      // layout size, unaffected by the footer's scale-in transform
      const width = host.offsetWidth, height = host.offsetHeight;
      cv.width = width * dpr;
      cv.height = height * dpr;
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / GAP) + 1;
      rows = Math.ceil(height / GAP) + 1;
      // centre the lattice so the edges have equal margins
      ox = (width - (cols - 1) * GAP) / 2;
      oy = (height - (rows - 1) * GAP) / 2;
      energy = new Float32Array(cols * rows);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      let active = false;
      const at = (c: number, r: number) => energy[r * cols + c];
      const px = (c: number) => ox + c * GAP;
      const py = (r: number) => oy + r * GAP;

      // lines first, so dots sit on top
      ctx.lineWidth = 1.2;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const e = at(c, r);
          if (e < 0.02) continue;
          for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) {
            const nc = c + dc, nr = r + dr;
            if (nc < 0 || nc >= cols || nr >= rows) continue;
            const a = Math.min(e, at(nc, nr));
            // diagonals only join strongly lit pairs, which gives the sparse "shape" look
            const alpha = dc && dr ? (a > 0.45 ? (a - 0.45) * 1.4 : 0) : a;
            if (alpha < 0.02) continue;
            ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.85})`;
            ctx.beginPath();
            ctx.moveTo(px(c), py(r));
            ctx.lineTo(px(nc), py(nr));
            ctx.stroke();
          }
        }

      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const e = energy[i];
          ctx.fillStyle = `rgba(255,255,255,${0.22 + e * 0.78})`;
          ctx.beginPath();
          ctx.arc(px(c), py(r), 1.6 + e * 2.4, 0, Math.PI * 2);
          ctx.fill();
          energy[i] = e * DECAY;
          if (energy[i] > 0.01) active = true;
        }

      // keep animating only while something is still fading out
      raf = active ? requestAnimationFrame(draw) : 0;
    };

    const onMove = (ev: PointerEvent) => {
      if (still) return;
      const b = host.getBoundingClientRect();
      const k = host.offsetWidth / b.width; // undo any scale on the host
      const x = (ev.clientX - b.left) * k, y = (ev.clientY - b.top) * k;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const d = Math.hypot(ox + c * GAP - x, oy + r * GAP - y);
          if (d < RADIUS) {
            const i = r * cols + c;
            energy[i] = Math.max(energy[i], 1 - d / RADIUS);
          }
        }
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    host.addEventListener("pointermove", onMove);
    return () => {
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvas} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden />;
}
