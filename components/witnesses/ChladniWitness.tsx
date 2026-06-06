"use client";

import { useEffect, useRef, useState } from "react";
import Witness from "@/components/blueprint/Witness";
import Dial from "@/components/blueprint/Dial";
import Readout from "@/components/blueprint/Readout";
import { useSimulation } from "@/lib/sim/useSimulation";
import {
  CHLADNI_EIGEN,
  CHLADNI_MAX,
  CHLADNI_MIN,
  CHLADNI_PRESETS,
  chladniResonance,
  createChladni,
  nearestMode,
  type Chladni,
} from "@/lib/chladni";

const OPEN = CHLADNI_PRESETS[1].f; // (2,3)

export default function ChladniWitness({ index }: { index: number }) {
  const [freq, setFreq] = useState(OPEN);
  const [supported, setSupported] = useState(true);
  const chladniRef = useRef<Chladni | null>(null);
  const tRef = useRef(0);

  const canvasRef = useSimulation<Chladni | null>(
    {
      fit: { maxDpr: 2 },
      init: (canvas) => {
        const c = createChladni(canvas);
        chladniRef.current = c;
        if (!c) setSupported(false);
        return c;
      },
      draw: ({ state }) => {
        tRef.current += 1 / 60;
        state?.frame(tRef.current);
      },
      dispose: (state) => state?.dispose(),
    },
    []
  );

  useEffect(() => {
    chladniRef.current?.setFrequency(freq);
  }, [freq]);

  const A = chladniResonance(freq);
  const resonant = A > 0.5;
  const near = nearestMode(freq);

  return (
    <Witness
      index={index}
      title="Order at a number"
      subtitle="Chladni figures of a square plate"
      lead={
        <>
          <p>
            Scatter fine sand on a metal plate and draw a bow across its edge.
            At almost every pitch the grains only shiver and wander, with no
            picture in them, just agitation.
          </p>
          <p className="mt-4">
            Then you find a note. The plate divides itself into still lines and
            trembling fields, and the sand walks itself into a figure of perfect
            symmetry. A hair sharp or flat and it dissolves. The plate will hold
            a pattern <em>only</em> at its exact resonant frequencies, a ladder
            of single numbers standing in a continuum of silence.
          </p>
        </>
      }
      controls={
        supported ? (
          <>
            <Dial
              label="drive frequency"
              value={freq}
              min={CHLADNI_MIN}
              max={CHLADNI_MAX}
              step={1}
              onChange={setFreq}
              marks={CHLADNI_EIGEN}
              unit="Hz"
              format={(v) => Math.round(v).toString()}
            />

            <div className="flex flex-wrap gap-1.5">
              {CHLADNI_PRESETS.map((p) => (
                <button
                  key={`${p.n}-${p.m}`}
                  type="button"
                  onClick={() => setFreq(p.f)}
                  className="caption rounded-sm border px-2 py-1 normal-case tracking-wide transition-colors hairline hover:bg-ink hover:text-paper"
                >
                  {p.n}·{p.m}
                </button>
              ))}
            </div>

            <Readout
              label="response"
              value={resonant ? "RESONANT" : "off-resonance"}
              note={`${(A * 100).toFixed(0)}% of peak`}
              marked={!resonant}
            />
            <Readout
              label="nearest eigenmode"
              value={`(${near.n}, ${near.m})`}
              note={`${near.f} Hz`}
            />
          </>
        ) : (
          <p className="prose-sheet text-base">
            This plate needs WebGL2, which your browser isn&rsquo;t offering. Read on.
          </p>
        )
      }
      caption={
        <>
          The faint ticks on the dial are the plate&rsquo;s eigenfrequencies, the
          only frequencies at which a figure can form. Everywhere between them,
          the sand has nothing to say.
        </>
      }
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </Witness>
  );
}
