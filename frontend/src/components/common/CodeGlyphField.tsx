import React, { useEffect, useRef } from 'react';

const GLYPHS = ['.', ':', '/', '{', '}', '<', '>', '=', '#', ';'];

/**
 * Subtle syntax-glyph matrix rendered in IBM Plex Mono on a dark canvas.
 * Follows unslop/references/effects.md: static geometry baked per cell,
 * 8fps sparse shimmer, DPR capped at 2, paused when off-screen.
 */
export const CodeGlyphField: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cell = 14;
    let rafId = 0;
    let visible = true;
    let lastDraw = 0;
    let step = 0;

    interface Cell {
      x: number;
      y: number;
      baseLum: number;
      isAccent: boolean;
      seed: number;
    }

    let cells: Cell[] = [];
    let dpr = 1;
    let width = 0;
    let height = 0;

    const buildGrid = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.floor(width / cell);
      const rows = Math.floor(height / cell);
      cells = [];

      for (let r = 0; r < rows; r += 1) {
        const ny = r / Math.max(1, rows - 1);
        for (let c = 0; c < cols; c += 1) {
          const nx = c / Math.max(1, cols - 1);
          // Fade from left (calm space behind headline) into structured diagonal bracket/wave band on right
          const leftFade = Math.max(0, Math.min(1, (nx - 0.34) / 0.52));
          const verticalEnv = Math.sin(ny * Math.PI);
          const wave =
            0.5 +
            0.5 *
              Math.cos((nx * 4.2 - ny * 2.1) * Math.PI) *
              Math.sin((nx * 1.8 + ny * 3.1) * Math.PI * 0.7);
          const lum = leftFade * verticalEnv * (0.28 + 0.72 * wave);
          if (lum < 0.08) continue;

          const seed = Math.abs(Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1;
          cells.push({
            x: c * cell + cell * 0.5,
            y: r * cell + cell * 0.5,
            baseLum: lum,
            isAccent: lum > 0.78 && seed > 0.84,
            seed,
          });
        }
      }
    };

    const draw = (tick: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < cells.length; i += 1) {
        const c = cells[i];
        const pulse = prefersReduced ? 0 : Math.sin(c.seed * 60 + tick * 0.14);
        const shift = pulse > 0.92 ? 1 : 0;
        const idx = Math.min(
          GLYPHS.length - 1,
          Math.floor(c.baseLum * GLYPHS.length) + shift
        );
        if (c.isAccent) {
          ctx.fillStyle = `rgba(229, 160, 13, ${(0.32 + c.baseLum * 0.35).toFixed(2)})`;
        } else {
          const alpha = (0.08 + c.baseLum * 0.36).toFixed(2);
          ctx.fillStyle = `rgba(237, 237, 237, ${alpha})`;
        }
        ctx.fillText(GLYPHS[idx], c.x, c.y);
      }
    };

    buildGrid();
    draw(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    const onResize = () => {
      buildGrid();
      draw(step);
    };
    window.addEventListener('resize', onResize);

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      if (prefersReduced || !visible || now - lastDraw < 125) return;
      lastDraw = now;
      step += 1;
      draw(step);
    };
    if (!prefersReduced) {
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    />
  );
};
