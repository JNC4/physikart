/**
 * Phyllotaxis: the arrangement of seeds in a sunflower head, the scales of a
 * pinecone, the cells of a pineapple. A growing tip lays down one primordium at
 * a time, each a fixed angular turn from the one before, and they drift outward
 * as the tip grows. Vogel's model places the k-th seed at
 *
 *   r = c·sqrt(k),   theta = k·alpha
 *
 * The entire character of the finished head is decided by the divergence angle
 * alpha alone. Only one value fills the disk evenly, with no seams and no
 * spokes: the golden angle, set by the most irrational number there is. This
 * module is the honest article. It places the seeds by the formula and measures
 * how evenly they pack; the plate that draws them invents nothing.
 */

const PHI = (1 + Math.sqrt(5)) / 2;

/** The golden angle in degrees: 360·(2 − phi) = 360/phi². The true value. */
export const GOLDEN_ANGLE = 360 * (2 - PHI); // 137.50776405003785

/** Dial bounds, in degrees, a narrow neighbourhood around the golden angle. */
export const ANGLE_MIN = 130;
export const ANGLE_MAX = 145;

/** How many seeds we lay down. Enough that spokes are unmistakable. */
export const SEED_COUNT = 620;

export interface Seed {
  /** Centred coordinates in the unit disk, radius ≤ 1. */
  x: number;
  y: number;
}

/**
 * Place `n` seeds by Vogel's model for a divergence angle in degrees, normalised
 * so the outermost seed sits near radius 1.
 */
export function layout(n: number, angleDeg: number): Seed[] {
  const a = (angleDeg * Math.PI) / 180;
  const norm = 1 / Math.sqrt(n);
  const seeds: Seed[] = new Array(n);
  for (let k = 0; k < n; k++) {
    const r = norm * Math.sqrt(k + 0.5);
    const t = k * a;
    seeds[k] = { x: r * Math.cos(t), y: r * Math.sin(t) };
  }
  return seeds;
}

/**
 * A scale-free measure of how evenly a layout packs: the smallest centre-to-
 * centre distance between any two seeds, divided by the spacing you would expect
 * if the same count filled the disk uniformly. An even packing holds its
 * neighbours apart, so this stays near 1. When the angle drifts toward a simple
 * fraction the seeds pile onto a few spokes, some pair falls almost on top of
 * another, and the number drops toward zero. O(n²), so the witness calls it only
 * when the angle changes, never inside the draw loop.
 */
export function packing(seeds: Seed[]): number {
  const n = seeds.length;
  const expected = Math.sqrt(Math.PI / n); // mean spacing for n points in a unit disk
  let best = Infinity;
  for (let i = 0; i < n; i++) {
    const si = seeds[i];
    for (let j = i + 1; j < n; j++) {
      const dx = si.x - seeds[j].x;
      const dy = si.y - seeds[j].y;
      const d2 = dx * dx + dy * dy;
      if (d2 < best) best = d2;
    }
  }
  return Math.sqrt(best) / expected;
}

/** The packing figure at the golden angle: the ideal every other angle is read against. */
export const GOLDEN_PACKING = packing(layout(SEED_COUNT, GOLDEN_ANGLE));

/**
 * A coarse, honest verdict for the readout. `ratio` is a layout's packing
 * divided by the golden-angle ideal. The golden angle is not a razor edge: a
 * broad neighbourhood of it, and a scattering of other near-noble angles, still
 * pack well above this line. What sits below it are the simple fractions of a
 * turn, where the seeds genuinely heap onto spokes.
 */
export function phyllotaxisRegime(ratio: number): { even: boolean; label: string } {
  if (ratio >= 0.5) return { even: true, label: "even fill, no seams" };
  return { even: false, label: "seeds heap onto spokes" };
}

/**
 * A few divergence angles worth jumping to: the golden optimum, then three
 * simple fractions of a turn that each spoke at their own count of arms
 * (135° = ⅜ → 8 arms, 144° = ⅖ → 5 arms, 140° → 18).
 */
export const PHYLLO_PRESETS: { name: string; angle: number }[] = [
  { name: "golden", angle: GOLDEN_ANGLE },
  { name: "135° ⅜", angle: 135 },
  { name: "140°", angle: 140 },
  { name: "144° ⅖", angle: 144 },
];
