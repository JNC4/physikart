interface ReadoutProps {
  label: string;
  value: string;
  /** Small note beneath the value (units, regime name, etc.). */
  note?: string;
  /** Draw the value in red pencil — e.g. when the system has left the alive band. */
  marked?: boolean;
}

/** A single dimensioned figure in the margin: label above, value numbered below. */
export default function Readout({ label, value, note, marked }: ReadoutProps) {
  return (
    <div className="border-t pt-2 hairline">
      <div className="caption">{label}</div>
      <div
        className={`numeral mt-0.5 text-lg tabular-nums ${
          marked ? "text-mark" : "text-ink"
        }`}
      >
        {value}
      </div>
      {note && <div className="caption mt-0.5 normal-case tracking-normal">{note}</div>}
    </div>
  );
}
