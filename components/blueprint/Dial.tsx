"use client";

import { useId } from "react";

export interface AliveBand {
  /** Inclusive lower/upper bound of the regime where order survives. */
  lo: number;
  hi: number;
}

interface DialProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** The real value, as it is. Marked in red pencil; the reader can restore it. */
  trueValue?: number;
  /** A discrete spectrum of special values — faint red ticks (eigenmodes, etc.). */
  marks?: number[];
  /** Shaded region on the track where order/beauty survives. */
  aliveBand?: AliveBand;
  unit?: string;
  /** Render the numeric value. Defaults to a sensible fixed precision. */
  format?: (v: number) => string;
}

const pct = (v: number, min: number, max: number) =>
  `${(((v - min) / (max - min)) * 100).toFixed(3)}%`;

export default function Dial({
  label,
  value,
  min,
  max,
  step,
  onChange,
  trueValue,
  marks,
  aliveBand,
  unit = "",
  format = (v) => v.toPrecision(4),
}: DialProps) {
  const id = useId();
  const atTrue =
    trueValue !== undefined && Math.abs(value - trueValue) < step / 2;

  return (
    <div className="select-none">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="caption">
          {label}
        </label>
        <span className="numeral text-sm tabular-nums text-ink">
          {format(value)}
          {unit && <span className="text-ink-soft">{` ${unit}`}</span>}
        </span>
      </div>

      <div className="relative mt-2 h-6">
        {/* alive band — where order survives */}
        {aliveBand && (
          <div
            className="absolute top-1/2 h-[6px] -translate-y-1/2 bg-mark-soft/30"
            style={{
              left: pct(aliveBand.lo, min, max),
              width: `calc(${pct(aliveBand.hi, min, max)} - ${pct(
                aliveBand.lo,
                min,
                max
              )})`,
              background:
                "repeating-linear-gradient(90deg, var(--mark-soft) 0 1px, transparent 1px 4px)",
              opacity: 0.5,
            }}
            aria-hidden
          />
        )}

        {/* baseline */}
        <div
          className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
          style={{ background: "var(--hair)" }}
          aria-hidden
        />

        {/* the discrete spectrum of special values — faint ticks */}
        {marks?.map((m, i) => (
          <div
            key={i}
            className="absolute top-1/2 h-2 w-px -translate-y-1/2"
            style={{ left: pct(m, min, max), background: "var(--mark-soft)" }}
            aria-hidden
          />
        ))}

        {/* the true value, in red pencil */}
        {trueValue !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-px"
            style={{ left: pct(trueValue, min, max), background: "var(--mark)" }}
            aria-hidden
          />
        )}

        {/* current-value thumb */}
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border"
          style={{
            left: pct(value, min, max),
            borderColor: "var(--hair)",
            background: atTrue ? "var(--mark)" : "var(--paper)",
          }}
          aria-hidden
        />

        {/* the real input sits on top, invisible but operable */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label={label}
          className="absolute inset-0 w-full cursor-ew-resize opacity-0"
        />
      </div>

      {trueValue !== undefined && (
        <button
          type="button"
          onClick={() => onChange(trueValue)}
          className="caption mt-1 inline-flex items-center gap-1 text-mark transition-opacity hover:opacity-70 disabled:opacity-30"
          disabled={atTrue}
        >
          <span className="inline-block h-px w-3 align-middle bg-mark" />
          restore true value
        </button>
      )}
    </div>
  );
}
