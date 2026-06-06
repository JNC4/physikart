"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Witness from "@/components/blueprint/Witness";
import Dial from "@/components/blueprint/Dial";
import Readout from "@/components/blueprint/Readout";
import { useSimulation } from "@/lib/sim/useSimulation";
import {
  JULIA_PRESETS,
  createJulia,
  juliaConnected,
  type Julia,
  type JuliaView,
} from "@/lib/julia";

const OPEN = JULIA_PRESETS[1]; // "San Marco", on the real axis where the ¼ mark holds
const DEFAULT_VIEW: JuliaView = { cx: 0, cy: 0, scale: 1.4 };

export default function JuliaWitness({ index }: { index: number }) {
  const [re, setRe] = useState(OPEN.re);
  const [im, setIm] = useState(OPEN.im);
  const [supported, setSupported] = useState(true);
  const [zoom, setZoom] = useState(1);
  const juliaRef = useRef<Julia | null>(null);
  const viewRef = useRef<JuliaView>({ ...DEFAULT_VIEW });
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const canvasRef = useSimulation<Julia | null>(
    {
      fit: { maxDpr: 2 },
      init: (canvas, size) => {
        const j = createJulia(canvas);
        juliaRef.current = j;
        if (!j) setSupported(false);
        else {
          j.setC(OPEN.re, OPEN.im);
          j.setAspect(size.cssWidth / size.cssHeight);
          j.setView(viewRef.current);
        }
        return j;
      },
      resize: ({ state, size }) =>
        state?.setAspect(size.cssWidth / size.cssHeight),
      draw: ({ state }) => state?.frame(),
      dispose: (state) => state?.dispose(),
    },
    []
  );

  useEffect(() => {
    juliaRef.current?.setC(re, im);
  }, [re, im]);

  const applyView = useCallback((v: JuliaView) => {
    viewRef.current = v;
    juliaRef.current?.setView(v);
    setZoom(DEFAULT_VIEW.scale / v.scale);
  }, []);

  // Wheel-zoom about the cursor — native listener so we can stop page scroll.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const aspect = rect.width / rect.height;
      const v = viewRef.current;
      const fx = (e.clientX - rect.left) / rect.width;
      const fy = (e.clientY - rect.top) / rect.height;
      // world point under the cursor (screen y is down; complex y is up)
      const wx = v.cx + (fx - 0.5) * 2 * v.scale * aspect;
      const wy = v.cy + (0.5 - fy) * 2 * v.scale;
      const factor = Math.exp(e.deltaY * 0.0012);
      const scale = Math.min(2.5, Math.max(2e-5, v.scale * factor));
      applyView({ cx: wx + (v.cx - wx) * (scale / v.scale), cy: wy + (v.cy - wy) * (scale / v.scale), scale });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [applyView]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const aspect = rect.width / rect.height;
    const v = viewRef.current;
    const dx = ((e.clientX - d.x) / rect.width) * 2 * v.scale * aspect;
    const dy = ((e.clientY - d.y) / rect.height) * 2 * v.scale;
    dragRef.current = { x: e.clientX, y: e.clientY };
    applyView({ cx: v.cx - dx, cy: v.cy + dy, scale: v.scale });
  };
  const endDrag = () => (dragRef.current = null);

  const connected = juliaConnected(re, im);

  return (
    <Witness
      index={index}
      title="Connected, or dust"
      subtitle="Julia sets of z² + c"
      lead={
        <>
          <p>
            Pick a single complex number c. For every point of the plane, ask
            whether repeatedly squaring it and adding c keeps it bounded. The
            points that stay form an intricate shape, and the same squaring rule
            writes its detail at every depth you care to zoom.
          </p>
          <p className="mt-4">
            Now move c. While c stays inside the Mandelbrot set the shape holds
            as a single connected body. The instant c steps over the boundary,
            the body disintegrates into a dust of infinitely many disconnected
            pieces. The change is total, and it turns on a boundary of zero
            width. On the real axis that crossing falls at exactly one quarter.
          </p>
        </>
      }
      controls={
        supported ? (
          <>
            <Dial
              label="c · real part"
              value={re}
              min={-2}
              max={1}
              step={0.001}
              onChange={setRe}
              trueValue={0.25}
              aliveBand={{ lo: -2, hi: 0.25 }}
              format={(v) => v.toFixed(3)}
            />
            <Dial
              label="c · imaginary part"
              value={im}
              min={-1.2}
              max={1.2}
              step={0.001}
              onChange={setIm}
              format={(v) => v.toFixed(3)}
            />

            <div className="flex flex-wrap gap-1.5">
              {JULIA_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setRe(p.re);
                    setIm(p.im);
                    applyView({ ...DEFAULT_VIEW });
                  }}
                  className="caption rounded-sm border px-2 py-1 normal-case tracking-wide transition-colors hairline hover:bg-ink hover:text-paper"
                >
                  {p.name}
                </button>
              ))}
            </div>

            <Readout
              label="topology"
              value={connected ? "CONNECTED" : "DUST"}
              note={connected ? "c lies in the Mandelbrot set" : "c lies outside it"}
              marked={!connected}
            />
            <Readout
              label="magnification"
              value={`${zoom < 1000 ? zoom.toFixed(1) : zoom.toExponential(1)}×`}
              note="scroll to zoom · drag to pan"
            />

            <button
              type="button"
              onClick={() => applyView({ ...DEFAULT_VIEW })}
              className="caption mt-1 self-start border-b text-ink-soft hairline hover:text-ink"
            >
              reset view
            </button>
          </>
        ) : (
          <p className="prose-sheet text-base">
            This plate needs WebGL2, which your browser isn&rsquo;t offering. Read on.
          </p>
        )
      }
      caption={
        <>
          The red mark is the real-axis boundary at c = ¼. Cross it, or carry c
          out of the set in any direction, and watch the body in the plate break
          into dust. Zoom in anywhere and the detail never runs out.
        </>
      }
    >
      <div
        ref={wrapRef}
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </Witness>
  );
}
