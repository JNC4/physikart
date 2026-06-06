"use client";

import { useEffect, useRef, useState } from "react";
import Witness from "@/components/blueprint/Witness";
import Dial from "@/components/blueprint/Dial";
import Readout from "@/components/blueprint/Readout";
import { useSimulation } from "@/lib/sim/useSimulation";
import {
  ANGLE_MAX,
  ANGLE_MIN,
  GOLDEN_ANGLE,
  GOLDEN_PACKING,
  PHYLLO_PRESETS,
  SEED_COUNT,
  layout,
  packing,
  phyllotaxisRegime,
} from "@/lib/phyllotaxis";

const PLATE = "#0a0b0d";
const BONE = "#e9e4d6";

export default function PhyllotaxisWitness({ index }: { index: number }) {
  const [angle, setAngle] = useState(GOLDEN_ANGLE);
  const angleRef = useRef(angle);
  angleRef.current = angle;

  // Packing is O(n²); recompute only when the angle settles, never per frame.
  const [ratio, setRatio] = useState(1);
  useEffect(() => {
    setRatio(packing(layout(SEED_COUNT, angle)) / GOLDEN_PACKING);
  }, [angle]);

  const canvasRef = useSimulation<object>(
    {
      fit: { maxDpr: 2, scale2d: true },
      pauseOffscreen: true,
      init: () => ({}),
      draw: ({ canvas, size }) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const w = size.cssWidth;
        const h = size.cssHeight;
        ctx.fillStyle = PLATE;
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const R = Math.min(w, h) * 0.46;
        const a = (angleRef.current * Math.PI) / 180;
        const n = SEED_COUNT;
        const norm = 1 / Math.sqrt(n);

        // Nothing here is drawn by hand. Each dot is one seed of Vogel's model,
        // placed exactly one divergence angle around from the last.
        ctx.fillStyle = BONE;
        for (let k = 0; k < n; k++) {
          const r = norm * Math.sqrt(k + 0.5) * R;
          const t = k * a;
          const rad = 0.8 + 1.5 * (k / n); // outer florets a touch larger, as in a real head
          ctx.beginPath();
          ctx.arc(cx + r * Math.cos(t), cy + r * Math.sin(t), rad, 0, Math.PI * 2);
          ctx.fill();
        }
      },
    },
    []
  );

  const regime = phyllotaxisRegime(ratio);

  return (
    <Witness
      index={index}
      title="The angle that never repeats"
      subtitle="phyllotaxis and the golden ratio"
      lead={
        <>
          <p>
            A growing tip lays down its seeds one at a time, and each new seed
            sits a fixed turn around the centre from the seed before it. A
            sunflower does this, and a pinecone, and the scales of a pineapple.
            The whole look of the finished head, whether it fills evenly or breaks
            into coarse spokes, is settled by that one angle and nothing else.
          </p>
          <p className="mt-4">
            Set the angle to a simple fraction of a turn and the seeds fall onto
            a handful of radial arms with bare ground between them. Every fraction
            does this, each at its own count of arms, and those angles lie
            scattered the length of the dial. One value alone slips past all of
            them, because the number that names it, the golden ratio, is the
            hardest of all to reach with any fraction. There, near 137.508
            degrees, the seeds pack the tightest and leave no seam.
          </p>
        </>
      }
      controls={
        <>
          <Dial
            label="divergence angle"
            value={angle}
            min={ANGLE_MIN}
            max={ANGLE_MAX}
            step={0.01}
            onChange={setAngle}
            trueValue={GOLDEN_ANGLE}
            unit="°"
            format={(v) => v.toFixed(2)}
          />

          <div className="flex flex-wrap gap-1.5">
            {PHYLLO_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setAngle(p.angle)}
                className="caption rounded-sm border px-2 py-1 normal-case tracking-wide transition-colors hairline hover:bg-ink hover:text-paper"
              >
                {p.name}
              </button>
            ))}
          </div>

          <Readout
            label="fill"
            value={regime.even ? "EVEN" : "SPOKED"}
            note={regime.label}
            marked={!regime.even}
          />
          <Readout
            label="packing"
            value={`${(ratio * 100).toFixed(0)}%`}
            note="of the golden-angle ideal"
            marked={!regime.even}
          />
        </>
      }
      caption={
        <>
          The red mark is the golden angle, the most irrational number there is
          turned into a heading. It is the one angle that never lets the seeds
          fall into line at any scale. Slide toward a simple fraction of a turn,
          three eighths at 135 degrees or two fifths at 144, and watch them heap
          onto a few bare spokes. The plate draws nothing but dots placed one
          turn apart; the figure is the angle&rsquo;s doing.
        </>
      }
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </Witness>
  );
}
