"use client";

import { useEffect, useRef, useState } from "react";
import Witness from "@/components/blueprint/Witness";
import Dial from "@/components/blueprint/Dial";
import Readout from "@/components/blueprint/Readout";
import { useSimulation } from "@/lib/sim/useSimulation";
import {
  ALIVE_FORCE,
  FORCE_MAX,
  FORCE_MIN,
  FORCE_PRESETS,
  TRUE_FORCE,
  carbonRegime,
  relativeRate,
  resonanceEnergy,
  yields,
} from "@/lib/triple-alpha";

const PLATE = "#0a0b0d";
const BONE = "#e9e4d6";
const MARK = "#b8402a";

const fmtRate = (r: number) =>
  r >= 0.01 && r < 100 ? `${r.toFixed(2)}×` : `${r.toExponential(1)}×`;

export default function CarbonResonanceWitness({ index }: { index: number }) {
  const [force, setForce] = useState(TRUE_FORCE);
  const forceRef = useRef(force);
  forceRef.current = force;
  useEffect(() => {
    forceRef.current = force;
  }, [force]);

  const canvasRef = useSimulation<object>(
    {
      fit: { maxDpr: 2, scale2d: true },
      init: () => ({}),
      draw: ({ canvas, size }) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const w = size.cssWidth;
        const h = size.cssHeight;
        ctx.fillStyle = PLATE;
        ctx.fillRect(0, 0, w, h);

        const padX = 12;
        const padT = 14;
        const padB = 20;
        const xL = padX;
        const xR = w - padX;
        const yB = h - padB;
        const yT = padT;
        const X = (d: number) =>
          xL + ((d - FORCE_MIN) / (FORCE_MAX - FORCE_MIN)) * (xR - xL);
        const Y = (v: number) => yB + (v / 1.4) * (yT - yB); // headroom: oxygen peaks above carbon's

        // The life-bearing band: where both carbon and oxygen survive.
        ctx.fillStyle = "rgba(184,64,42,0.10)";
        ctx.fillRect(X(ALIVE_FORCE.lo), yT, X(ALIVE_FORCE.hi) - X(ALIVE_FORCE.lo), yB - yT);
        ctx.strokeStyle = "rgba(184,64,42,0.35)";
        ctx.lineWidth = 1;
        for (const e of [ALIVE_FORCE.lo, ALIVE_FORCE.hi]) {
          ctx.beginPath();
          ctx.moveTo(X(e), yB);
          ctx.lineTo(X(e), yT);
          ctx.stroke();
        }

        // Baseline.
        ctx.strokeStyle = "rgba(233,228,214,0.22)";
        ctx.beginPath();
        ctx.moveTo(xL, yB);
        ctx.lineTo(xR, yB);
        ctx.stroke();

        const N = Math.max(80, Math.floor(w));
        const dAt = (i: number) => FORCE_MIN + (i / N) * (FORCE_MAX - FORCE_MIN);

        // Oxygen, faint and dashed.
        ctx.strokeStyle = "rgba(233,228,214,0.45)";
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const d = dAt(i);
          const y = Y(yields(d).oxygen);
          i ? ctx.lineTo(X(d), y) : ctx.moveTo(X(d), y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Carbon, filled and solid.
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const d = dAt(i);
          const y = Y(yields(d).carbon);
          i ? ctx.lineTo(X(d), y) : ctx.moveTo(X(d), y);
        }
        ctx.lineTo(xR, yB);
        ctx.lineTo(xL, yB);
        ctx.closePath();
        ctx.fillStyle = "rgba(233,228,214,0.07)";
        ctx.fill();
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const d = dAt(i);
          const y = Y(yields(d).carbon);
          i ? ctx.lineTo(X(d), y) : ctx.moveTo(X(d), y);
        }
        ctx.strokeStyle = BONE;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // The true value of the strong force.
        ctx.strokeStyle = MARK;
        ctx.globalAlpha = 0.8;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(X(TRUE_FORCE), yB);
        ctx.lineTo(X(TRUE_FORCE), yT);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // Where the dial sits now, with a marker on each curve.
        const d = forceRef.current;
        ctx.strokeStyle = BONE;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(X(d), yB);
        ctx.lineTo(X(d), yT);
        ctx.stroke();
        ctx.globalAlpha = 1;
        const yc = yields(d);
        ctx.fillStyle = BONE;
        ctx.beginPath();
        ctx.arc(X(d), Y(yc.carbon), 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(X(d), Y(yc.oxygen), 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Labels.
        ctx.font = "10px monospace";
        ctx.fillStyle = MARK;
        ctx.fillText("true", X(TRUE_FORCE) + 4, yT + 10);
        ctx.fillStyle = "rgba(233,228,214,0.85)";
        ctx.fillText("C", xR - 14, Y(yields(FORCE_MAX).carbon) - 4);
        ctx.fillStyle = "rgba(233,228,214,0.5)";
        ctx.fillText("O", xR - 14, Y(yields(FORCE_MAX).oxygen) - 4);
      },
    },
    []
  );

  const y = yields(force);
  const regime = carbonRegime(force);
  const rate = relativeRate(force);

  return (
    <Witness
      index={index}
      title="The carbon resonance"
      subtitle="the triple-alpha process and the Hoyle state"
      aspect="16 / 10"
      lead={
        <>
          <p>
            Every carbon atom in you was assembled inside a star, three helium
            nuclei at a time. That reaction would be hopelessly slow, but for one
            thing: the carbon nucleus carries an energy level sitting almost
            exactly where the heat of the star can reach it. Fred Hoyle reasoned
            that the level had to exist, on no evidence but the fact that carbon
            does. It was found at the energy he named.
          </p>
          <p className="mt-4">
            Shift the strength of the strong nuclear force by a single percent
            and that level slides off the narrow thermal window. The reaction
            rate, riding the same exponential that sets every fusion rate in
            every star, falls by orders of magnitude, and the carbon is never
            made. Push the force the other way and the carbon that forms is
            burned on to oxygen. A star makes both, the two atoms a chemistry
            needs, only inside a narrow band of one constant. Hoyle, who began an
            unbeliever, wrote that it looked as though a superintellect had
            monkeyed with physics.
          </p>
        </>
      }
      controls={
        <>
          <Dial
            label="strong-force shift"
            value={force}
            min={FORCE_MIN}
            max={FORCE_MAX}
            step={0.01}
            onChange={setForce}
            trueValue={TRUE_FORCE}
            aliveBand={ALIVE_FORCE}
            unit="%"
            format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}`}
          />

          <div className="flex flex-wrap gap-1.5">
            {FORCE_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setForce(p.d)}
                className="caption rounded-sm border px-2 py-1 normal-case tracking-wide transition-colors hairline hover:bg-ink hover:text-paper"
              >
                {p.name}
              </button>
            ))}
          </div>

          <Readout
            label="outcome"
            value={
              y.carbon >= 0.1 && y.oxygen >= 0.1
                ? "C + O"
                : y.carbon >= 0.1
                ? "C only"
                : y.oxygen >= 0.1
                ? "O only"
                : "barren"
            }
            note={regime.label}
            marked={!regime.alive}
          />
          <Readout
            label="carbon yield"
            value={`${(y.carbon * 100).toFixed(0)}%`}
            note="of its best-case abundance"
            marked={y.carbon < 0.1}
          />
          <Readout
            label="triple-alpha rate"
            value={fmtRate(rate)}
            note="vs our universe, real Gamow factor"
          />
          <Readout
            label="Hoyle level"
            value={`${resonanceEnergy(force).toFixed(0)} keV`}
            note="above the three-alpha threshold"
          />
        </>
      }
      caption={
        <>
          The dial moves the strong nuclear force; zero is its real value, and
          the red band is where a star makes both carbon and oxygen. The collapse
          on the weak side is the genuine article: the carbon rate falls as the
          resonance climbs the star&rsquo;s thermal slope, through the ordinary
          Boltzmann factor. The oxygen side of the window is a reduced model of
          the published result, drawn here to show the band has two walls, not
          one.
        </>
      }
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </Witness>
  );
}
