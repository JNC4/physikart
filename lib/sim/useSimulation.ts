"use client";

import { useEffect, useRef } from "react";
import { fitCanvas, type Size, type FitOptions } from "./canvas";

/**
 * The simulation engine core.
 *
 * One fixed-timestep accumulator loop per canvas. Simulation state lives in a
 * ref the caller creates in `init` — never in React state — so stepping the
 * physics at 120 Hz never triggers a re-render. React touches only the controls.
 *
 * The loop pauses automatically when its canvas scrolls offscreen or the tab is
 * hidden, which is essential: this is a single-scroll page with several live
 * fields, and we have no business burning a GPU on a plate nobody is looking at.
 */

export interface SimContext<S> {
  canvas: HTMLCanvasElement;
  size: Size;
  state: S;
}

export interface SimulationConfig<S> {
  /** Build persistent state once the canvas has a real size. */
  init: (canvas: HTMLCanvasElement, size: Size) => S;
  /** Advance the simulation by exactly `dt` seconds. Called 0..N times/frame. */
  step?: (ctx: SimContext<S>, dt: number) => void;
  /** Paint the current state. `alpha` interpolates between fixed steps [0,1). */
  draw: (ctx: SimContext<S>, alpha: number) => void;
  /** React to a resize (re-fit framebuffers, recompute layout, etc.). */
  resize?: (ctx: SimContext<S>) => void;
  /** Release GPU/host resources. */
  dispose?: (state: S) => void;
  /** Fixed physics timestep, seconds. Default 1/120. */
  fixedDt?: number;
  /** Passed through to fitCanvas (maxDpr, scale2d). */
  fit?: FitOptions;
  /** Pause the loop while the canvas is offscreen. Default true. */
  pauseOffscreen?: boolean;
}

export function useSimulation<S>(
  config: SimulationConfig<S>,
  deps: React.DependencyList = []
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Latest config in a ref so step/draw closures never go stale without
  // forcing the whole loop to tear down and rebuild.
  const cfgRef = useRef(config);
  cfgRef.current = config;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fixedDt = cfgRef.current.fixedDt ?? 1 / 120;
    const fitOpts = cfgRef.current.fit;
    const pauseOffscreen = cfgRef.current.pauseOffscreen ?? true;

    let state: S | null = null;
    let size: Size | null = null;
    let raf = 0;
    let lastTime = 0;
    let accumulator = 0;
    let visible = !pauseOffscreen;
    let pageVisible = !document.hidden;

    const ensureState = (): boolean => {
      const s = fitCanvas(canvas, fitOpts);
      if (!s) return false;
      size = s;
      if (state === null) {
        state = cfgRef.current.init(canvas, size);
      }
      return true;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (state === null || size === null) {
        if (!ensureState()) return;
      }
      const ctx: SimContext<S> = { canvas, size: size!, state: state! };

      // Seconds since last frame, clamped to avoid a spiral of death after a
      // stall (tab refocus, GC pause). At most ~250 ms of catch-up per frame.
      const elapsed = lastTime === 0 ? 0 : Math.min((now - lastTime) / 1000, 0.25);
      lastTime = now;

      const step = cfgRef.current.step;
      if (step) {
        accumulator += elapsed;
        let guard = 0;
        while (accumulator >= fixedDt && guard < 8) {
          step(ctx, fixedDt);
          accumulator -= fixedDt;
          guard++;
        }
      }
      const alpha = step ? accumulator / fixedDt : 0;
      cfgRef.current.draw(ctx, alpha);
    };

    const start = () => {
      if (raf !== 0) return;
      if (!visible || !pageVisible) return;
      lastTime = 0; // resync clock so a resumed loop doesn't fast-forward
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // Re-fit on layout changes.
    const ro = new ResizeObserver(() => {
      if (!ensureState() || state === null || size === null) return;
      cfgRef.current.resize?.({ canvas, size, state });
    });
    ro.observe(canvas);

    // Pause when the plate isn't on screen.
    let io: IntersectionObserver | null = null;
    if (pauseOffscreen) {
      io = new IntersectionObserver(
        (entries) => {
          visible = entries.some((e) => e.isIntersecting);
          if (visible) start();
          else stop();
        },
        { threshold: 0 }
      );
      io.observe(canvas);
    }

    // Pause when the tab is hidden.
    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    start();

    return () => {
      stop();
      ro.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (state !== null) cfgRef.current.dispose?.(state);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return canvasRef;
}
