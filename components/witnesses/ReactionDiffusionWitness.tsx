"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Witness from "@/components/blueprint/Witness";
import Dial from "@/components/blueprint/Dial";
import Readout from "@/components/blueprint/Readout";
import { useSimulation } from "@/lib/sim/useSimulation";
import {
  ALIVE_FEED,
  ALIVE_KILL,
  RD_PRESETS,
  createReactionDiffusion,
  rdRegime,
  type ReactionDiffusion,
} from "@/lib/reaction-diffusion";

// Open on a living configuration, so the plate greets the reader full of pattern.
const OPEN = RD_PRESETS[0]; // "coral"

export default function ReactionDiffusionWitness({ index }: { index: number }) {
  const [f, setF] = useState(OPEN.f);
  const [k, setK] = useState(OPEN.k);
  const [supported, setSupported] = useState(true);
  const rdRef = useRef<ReactionDiffusion | null>(null);
  const paintingRef = useRef(false);

  const canvasRef = useSimulation<ReactionDiffusion | null>(
    {
      fit: { maxDpr: 2 },
      pauseOffscreen: true,
      init: (canvas) => {
        const rd = createReactionDiffusion(canvas);
        rdRef.current = rd;
        if (!rd) setSupported(false);
        else rd.setParams({ f: OPEN.f, k: OPEN.k });
        return rd;
      },
      draw: ({ state }) => state?.frame(),
      dispose: (state) => state?.dispose(),
    },
    []
  );

  // Dials drive the live PDE.
  useEffect(() => {
    rdRef.current?.setParams({ f, k });
  }, [f, k]);

  const seedAt = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rd = rdRef.current;
    if (!rd) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height; // flip for GL uv
    rd.seed(x, y, 0.03);
  }, []);

  const regime = rdRegime(f, k);

  return (
    <Witness
      index={index}
      title="The band of life"
      subtitle="Gray-Scott reaction-diffusion"
      lead={
        <>
          <p>
            Two chemicals diffuse and feed on one another on an even field.
            Nothing here decides to become a leopard&rsquo;s coat, a coral, or a
            dividing cell. The same two lines of arithmetic run at every point,
            and the pattern is what those lines <em>must</em> produce.
          </p>
          <p className="mt-4">
            And only just here. The whole of this teeming variety lives inside a
            thin, curved sliver of the feed/kill plane. Turn either dial off its
            narrow band and the field stops. It settles to a flat, sterile
            uniform, chemistry with the life subtracted out.
          </p>
        </>
      }
      controls={
        supported ? (
          <>
            <Dial
              label="feed rate ƒ"
              value={f}
              min={0}
              max={0.1}
              step={0.0001}
              onChange={setF}
              trueValue={OPEN.f}
              aliveBand={ALIVE_FEED}
              format={(v) => v.toFixed(4)}
            />
            <Dial
              label="kill rate k"
              value={k}
              min={0.03}
              max={0.075}
              step={0.0001}
              onChange={setK}
              trueValue={OPEN.k}
              aliveBand={ALIVE_KILL}
              format={(v) => v.toFixed(4)}
            />

            <div className="flex flex-wrap gap-1.5">
              {RD_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setF(p.f);
                    setK(p.k);
                  }}
                  className="caption rounded-sm border px-2 py-1 normal-case tracking-wide transition-colors hairline hover:bg-ink hover:text-paper"
                >
                  {p.name}
                </button>
              ))}
            </div>

            <Readout
              label="status"
              value={regime.alive ? "ALIVE" : "STERILE"}
              note={regime.name}
              marked={!regime.alive}
            />
            <Readout
              label="living region"
              value="a sliver"
              note="of the whole feed/kill plane"
            />

            <button
              type="button"
              onClick={() => rdRef.current?.reset()}
              className="caption mt-1 self-start border-b text-ink-soft hairline hover:text-ink"
            >
              reseed the field
            </button>
          </>
        ) : (
          <p className="prose-sheet text-base">
            This plate needs WebGL2 with float framebuffers, which your browser
            isn&rsquo;t offering. The argument survives without it; read on.
          </p>
        )
      }
      caption={
        <>
          The marked value (red) is a configuration that <em>lives</em>. Drag
          either dial away from its band and watch the plate itself. The field
          decides whether anything can exist, whatever the label says. Click the
          plate to seed new reagent.
        </>
      }
    >
      <div
        className="absolute inset-0 cursor-crosshair"
        onPointerDown={(e) => {
          paintingRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          seedAt(e);
        }}
        onPointerMove={(e) => paintingRef.current && seedAt(e)}
        onPointerUp={() => (paintingRef.current = false)}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </Witness>
  );
}
