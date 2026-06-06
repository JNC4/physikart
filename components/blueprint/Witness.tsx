import type { ReactNode } from "react";

interface WitnessProps {
  /** Plate number in the exhibition, e.g. 1 → "01". */
  index: number;
  title: string;
  /** The mechanism, set small: "Gray–Scott reaction–diffusion". */
  subtitle?: string;
  /** The framing argument — sparse prose carrying the thesis forward. */
  lead: ReactNode;
  /** The live field. Fills the dark plate. */
  children: ReactNode;
  /** Dials and readouts, drawn in the margin. */
  controls: ReactNode;
  /** Aspect ratio of the plate, CSS form. Default square. */
  aspect?: string;
  /** A closing annotation beneath the plate — typically the marked-value note. */
  caption?: ReactNode;
}

const two = (n: number) => n.toString().padStart(2, "0");

/**
 * One plate in the exhibition: a framing argument, a dark instrument-plate
 * holding the live field, and a margin of dials + dimensioned readouts. Every
 * witness wears this same grammar — different creation, identical signature.
 */
export default function Witness({
  index,
  title,
  subtitle,
  lead,
  children,
  controls,
  aspect = "1 / 1",
  caption,
}: WitnessProps) {
  return (
    <section className="mx-auto w-full max-w-sheet px-5 py-24 md:py-32">
      <header className="mb-6 flex items-baseline gap-4 border-b pb-3 hairline">
        <span className="numeral text-sm text-mark tabular-nums">{two(index)}</span>
        <h2 className="label text-2xl font-medium tracking-tight md:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <span className="caption ml-auto hidden text-right sm:block">
            {subtitle}
          </span>
        )}
      </header>

      <div className="prose-sheet mb-10">{lead}</div>

      <div className="grid gap-8 md:grid-cols-[1fr_15rem]">
        {/* The plate */}
        <div className="plate plate-registered" style={{ aspectRatio: aspect }}>
          <div className="absolute inset-[7px] overflow-hidden">{children}</div>
          <span
            className="caption absolute right-2 top-2 z-10"
            style={{ color: "rgba(233,228,214,0.45)" }}
          >
            fig. {two(index)}
          </span>
        </div>

        {/* The margin */}
        <aside className="flex flex-col gap-5">{controls}</aside>
      </div>

      {caption && (
        <p className="caption mt-5 max-w-prose normal-case leading-relaxed tracking-normal text-ink-soft">
          {caption}
        </p>
      )}
    </section>
  );
}
