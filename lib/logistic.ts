/**
 * The logistic map  xₙ₊₁ = r·xₙ·(1 − xₙ).
 *
 * A single knob, r. Turn it up and a stable population splits into a two-year
 * cycle, then four, then eight — the splits crowding closer and closer until,
 * at r∞ = 3.5699…, the period becomes infinite and the system tips into chaos.
 *
 * The crowding is not arbitrary. The ratio of one fork-spacing to the next
 * approaches Feigenbaum's δ = 4.6692… — and the very same number governs the
 * route to chaos in dripping taps, oscillating chemicals, and heated fluids
 * that share no physics at all. A constant, written underneath unrelated things.
 */

export const R_MIN = 2.8;
export const R_MAX = 4.0;

/** The accumulation point — the edge of chaos. */
export const R_INFINITY = 3.5699456718695445;

/** Feigenbaum's first constant. */
export const FEIGENBAUM_DELTA = 4.669201609102990;

/** Period-doubling thresholds: period 1→2→4→8→16→32. */
export const BIFURCATIONS = [
  3.0, 3.449489743, 3.544090359, 3.564407266, 3.568759420, 3.569691610,
];

/** A celebrated window of order inside the chaos: a period-3 cycle. */
export const PERIOD_3_WINDOW = 3.828427125;

/** Marks for the dial: the cascade, plus the period-3 window. */
export const LOGISTIC_MARKS = [...BIFURCATIONS, PERIOD_3_WINDOW];

/** Samples of the attractor at r, after the transient has died away. */
export function attractor(r: number, n: number): number[] {
  let x = 0.5;
  for (let i = 0; i < 800; i++) x = r * x * (1 - x);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    x = r * x * (1 - x);
    out.push(x);
  }
  return out;
}

/** The period of the attractor at r, or 0 when it is chaotic / beyond maxPeriod. */
export function detectPeriod(r: number, maxPeriod = 64): number {
  let x = 0.5;
  for (let i = 0; i < 2000; i++) x = r * x * (1 - x);
  const seq: number[] = [];
  for (let i = 0; i < maxPeriod * 4; i++) {
    x = r * x * (1 - x);
    seq.push(x);
  }
  for (let p = 1; p <= maxPeriod; p++) {
    let ok = true;
    for (let i = 0; i + p < seq.length && i < maxPeriod * 2; i++) {
      if (Math.abs(seq[i] - seq[i + p]) > 1e-4) {
        ok = false;
        break;
      }
    }
    if (ok) return p;
  }
  return 0;
}

/** Name the regime at r, for the readout. */
export function logisticRegime(r: number): { period: number; label: string } {
  const period = detectPeriod(r);
  if (period === 0) return { period, label: "chaotic" };
  if (period === 1) return { period, label: "fixed point" };
  return { period, label: `period-${period} cycle` };
}
