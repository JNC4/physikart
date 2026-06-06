interface OvertureProps {
  /** How many plates the exhibition holds, spelled in the subtitle. */
  plateCount: string;
}

/** The opening of the sheet: the thesis, stated once, then left to the plates. */
export default function Overture({ plateCount }: OvertureProps) {
  return (
    <header className="mx-auto flex min-h-screen w-full max-w-sheet flex-col justify-center px-5 py-24">
      <div className="caption mb-6 flex items-center gap-3">
        <span>PhysikArt</span>
        <span className="h-px flex-1 bg-[var(--hair)]" />
        <span className="numeral normal-case tracking-normal">{plateCount} plates</span>
      </div>

      <h1 className="label max-w-[14ch] text-5xl font-medium leading-[0.98] tracking-tight md:text-7xl">
        Fine-tuning,
        <br />
        made visible.
      </h1>

      <div className="prose-sheet mt-10 space-y-5">
        <p>
          Some numbers in this world sit on a knife-edge. Nudge one, and the
          order it was holding together (a pattern, a pure tone, a living form)
          comes apart. The field goes flat, the figure scatters, the motion
          unwinds into noise, or into nothing at all.
        </p>
        <p>
          This is an exhibition of such numbers. Every plate is a real system,
          simulated honestly, with its one true value marked in red. You are
          handed the dial. Turn it off the mark and watch what becomes of the
          beauty that stood there a moment before.
        </p>
      </div>

      <div className="caption mt-14 flex items-center gap-3 text-ink-faint">
        <span>scroll to begin</span>
        <span className="h-px w-10 bg-[var(--hair)]" />
      </div>
    </header>
  );
}
