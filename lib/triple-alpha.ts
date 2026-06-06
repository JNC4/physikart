/**
 * The triple-alpha process and the Hoyle state.
 *
 * Stars build carbon by fusing three helium nuclei. Two stick briefly into
 * beryllium-8; a third lands before it flies apart. That last capture would be
 * far too slow to seed a universe with carbon, except that carbon-12 has an
 * excited level sitting almost exactly at the energy the colliding nuclei bring,
 * about 379.5 keV above the three-alpha threshold. Fred Hoyle argued the level
 * had to be there, on the sole ground that carbon exists. It was found where he
 * said.
 *
 * HONESTY NOTE. The genuine, first-principles part of this model is the rate's
 * dependence on the resonance energy. For a narrow resonance the thermonuclear
 * reaction rate carries the factor exp(-E_R / kT), the same Boltzmann factor
 * that governs every fusion rate in every star. Move the strong force and E_R
 * moves, and that exponential is why the carbon rate falls off a cliff. That is
 * computed here exactly. The ignition threshold (does helium burn at all within
 * the star's life) and the carbon-to-oxygen depletion on the other side of the
 * window are a reduced model of the published result (Oberhummer, Csoto &
 * Schlattl 2000), not a first-principles burn. The witness says so on the plate.
 */

// --- Physical constants -----------------------------------------------------

/** The Hoyle resonance energy above the three-alpha threshold, in keV. */
const E_R0 = 379.5;
/** kT at a helium-burning temperature, T ≈ 1.5e8 K, in keV. */
const KT = 12.9;
/** keV of resonance shift per 1% change in the strong-force coupling (representative). */
const A = 200;

/** The carbon-12 Hoyle level, MeV, for display. */
export const HOYLE_LEVEL = 7.6549;

// --- The dial ---------------------------------------------------------------

/** Strong-force shift, in percent. Zero is our universe. */
export const FORCE_MIN = -3;
export const FORCE_MAX = 3;
export const TRUE_FORCE = 0;

// --- The model --------------------------------------------------------------

const sig = (x: number) => 1 / (1 + Math.exp(-x));

/** Resonance energy above threshold as the strong force shifts, in keV. */
export function resonanceEnergy(deltaPct: number): number {
  return E_R0 - A * deltaPct;
}

/**
 * The triple-alpha rate relative to our universe, the real Gamow/Boltzmann
 * factor exp((E_R0 - E_R) / kT). Swings many orders of magnitude across a single
 * percent: this is the steepness that makes carbon so precarious.
 */
export function relativeRate(deltaPct: number): number {
  return Math.exp((E_R0 - resonanceEnergy(deltaPct)) / KT);
}

// Reduced-model pieces (see honesty note).
const ignition = (d: number) => sig((d - -0.6) / 0.12); // helium burns once the rate clears threshold
const oxidation = (d: number) => sig((d - 0.2) / 0.35); // fraction of carbon burned on to oxygen

const rawCarbon = (d: number) => ignition(d) * (1 - oxidation(d));
const rawOxygen = (d: number) => ignition(d) * oxidation(d);

// Normalise carbon to its own peak so the plate reads in fractions of the best case.
const CARBON_PEAK = (() => {
  let peak = 0;
  for (let d = FORCE_MIN; d <= FORCE_MAX; d += 0.005) {
    const c = rawCarbon(d);
    if (c > peak) peak = c;
  }
  return peak;
})();

export interface Yields {
  /** Carbon abundance, as a fraction of its peak across the dial. */
  carbon: number;
  /** Oxygen abundance, on the same scale. */
  oxygen: number;
  /** Did helium ignite to carbon at all? */
  ignited: boolean;
}

export function yields(deltaPct: number): Yields {
  return {
    carbon: rawCarbon(deltaPct) / CARBON_PEAK,
    oxygen: rawOxygen(deltaPct) / CARBON_PEAK,
    ignited: ignition(deltaPct) > 0.5,
  };
}

/** A configuration counts as life-bearing when both carbon and oxygen survive. */
const PRESENT = 0.1;

export interface CarbonRegime {
  alive: boolean;
  label: string;
}

export function carbonRegime(deltaPct: number): CarbonRegime {
  const y = yields(deltaPct);
  const c = y.carbon >= PRESENT;
  const o = y.oxygen >= PRESENT;
  if (c && o) return { alive: true, label: "carbon and oxygen both form" };
  if (c) return { alive: false, label: "carbon, but little oxygen" };
  if (o) return { alive: false, label: "oxygen, but little carbon" };
  return { alive: false, label: y.ignited ? "burned past carbon" : "helium never ignites" };
}

/** The band of strong-force values where both carbon and oxygen are made. */
export const ALIVE_FORCE = (() => {
  let lo = TRUE_FORCE;
  let hi = TRUE_FORCE;
  for (let d = FORCE_MIN; d <= FORCE_MAX; d += 0.002) {
    if (carbonRegime(d).alive) {
      lo = Math.min(lo, d);
      hi = Math.max(hi, d);
    }
  }
  return { lo, hi };
})();

export const FORCE_PRESETS: { name: string; d: number }[] = [
  { name: "weaker", d: -1.2 },
  { name: "our universe", d: 0 },
  { name: "stronger", d: 1.5 },
];
