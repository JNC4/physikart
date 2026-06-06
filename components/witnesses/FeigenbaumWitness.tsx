"use client";

import { useEffect, useRef, useState } from "react";
import Witness from "@/components/blueprint/Witness";
import Dial from "@/components/blueprint/Dial";
import Readout from "@/components/blueprint/Readout";
import { useSimulation, type SimContext } from "@/lib/sim/useSimulation";
import {
  FEIGENBAUM_DELTA,
  LOGISTIC_MARKS,
  R_INFINITY,
  R_MAX,
  R_MIN,
  attractor,
  logisticRegime,
} from "@/lib/logistic";

const PLATE = "#0a0b0d";
const BONE = "#e9e4d6";
const MARK = "#b8402a";

interface BifState {
  off: HTMLCanvasElement;
}

const mapR = (r: number, w: number) => ((r - R_MIN) / (R_MAX - R_MIN)) * w;
const mapX = (x: number, h: number) => (1 - x) * h;

/** Render the bifurcation diagram once, at device resolution, into an offscreen. */
function renderBifurcation(off: HTMLCanvasElement, pw: number, ph: number) {
  off.width = pw;
  off.height = ph;
  const ctx = off.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = PLATE;
  ctx.fillRect(0, 0, pw, ph);
  ctx.fillStyle = "rgba(233,228,214,0.10)";
  for (let i = 0; i < pw; i++) {
    const r = R_MIN + (i / pw) * (R_MAX - R_MIN);
    let x = 0.5;
    for (let j = 0; j < 500; j++) x = r * x * (1 - x); // transient
    for (let j = 0; j < 260; j++) {
      x = r * x * (1 - x);
      ctx.fillRect(i, (1 - x) * ph, 1, 1);
    }
  }
}

export default function FeigenbaumWitness({ index }: { index: number }) {
  const [r, setR] = useState(3.2);
  const rRef = useRef(r);
  rRef.current = r;

  const canvasRef = useSimulation<BifState>(
    {
      fit: { maxDpr: 2, scale2d: true },
      init: (_canvas, size) => {
        const off = document.createElement("canvas");
        renderBifurcation(off, size.pixelWidth, size.pixelHeight);
        return { off };
      },
      resize: ({ state, size }) =>
        renderBifurcation(state.off, size.pixelWidth, size.pixelHeight),
      draw: ({ canvas, size, state }: SimContext<BifState>) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const w = size.cssWidth;
        const h = size.cssHeight;
        // The cached diagram (device px) scaled down into CSS space — crisp.
        ctx.drawImage(state.off, 0, 0, w, h);

        // The edge of chaos, marked in red.
        const xinf = mapR(R_INFINITY, w);
        ctx.strokeStyle = MARK;
        ctx.globalAlpha = 0.7;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(xinf, 0);
        ctx.lineTo(xinf, h);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "10px monospace";
        ctx.fillStyle = MARK;
        ctx.fillText("r∞", xinf + 4, 14);

        // Where the dial sits now.
        const rx = mapR(rRef.current, w);
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = BONE;
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx, h);
        ctx.stroke();

        // The live attractor slice: one dot per visited state. A single point
        // when periodic; a flickering smear when chaotic — sensitive dependence,
        // recomputed every frame.
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = BONE;
        for (const xv of attractor(rRef.current, 220)) {
          ctx.fillRect(rx - 1, mapX(xv, h) - 0.6, 2.5, 1.2);
        }
        ctx.globalAlpha = 1;
      },
    },
    []
  );

  // Touch r so the loop's draw picks it up immediately even while paused.
  useEffect(() => {
    rRef.current = r;
  }, [r]);

  const regime = logisticRegime(r);

  return (
    <Witness
      index={index}
      title="The constant beneath chaos"
      subtitle="the logistic map and Feigenbaum's δ"
      aspect="16 / 10"
      lead={
        <>
          <p>
            One equation for a population that grows and competes with itself.
            Raise the single parameter r and the steady level splits in two, then
            four, then eight, each doubling arriving sooner than the last, the
            forks crowding toward a wall at r∞ = 3.5699, where the period becomes
            infinite and order gives way to chaos.
          </p>
          <p className="mt-4">
            The crowding has a measure. Each gap is about 4.669 times the next,
            and that ratio, Feigenbaum&rsquo;s constant, is the same for a
            dripping tap and a stirred chemical reaction, which know nothing of
            this equation. A number sits underneath all of them.
          </p>
        </>
      }
      controls={
        <>
          <Dial
            label="growth rate r"
            value={r}
            min={R_MIN}
            max={R_MAX}
            step={0.0005}
            onChange={setR}
            trueValue={R_INFINITY}
            aliveBand={{ lo: R_MIN, hi: R_INFINITY }}
            marks={LOGISTIC_MARKS}
            format={(v) => v.toFixed(4)}
          />

          <Readout
            label="regime"
            value={regime.period === 0 ? "CHAOS" : `period ${regime.period}`}
            note={regime.label}
            marked={regime.period === 0}
          />
          <Readout
            label="Feigenbaum δ"
            value={FEIGENBAUM_DELTA.toFixed(6)}
            note="ratio of successive forks, universal"
          />
          <Readout
            label="edge of chaos"
            value={R_INFINITY.toFixed(6)}
            note="r∞, where the period turns infinite"
          />
        </>
      }
      caption={
        <>
          The red line is r∞, the edge of chaos; the faint ticks before it are
          the period-doublings, bunching as they approach it, and the lone tick
          beyond it marks the period-3 window, an island of order inside the
          chaos. Drag past r∞ and the single thread of order frays into a cloud.
          Then find that window in the plate, where the cloud snaps back to a few
          clean bands.
        </>
      }
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </Witness>
  );
}
