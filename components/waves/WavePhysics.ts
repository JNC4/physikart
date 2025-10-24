/**
 * Wave simulation using mass-spring model
 */
export class WaveString {
  private positions: number[];
  private velocities: number[];
  private numPoints: number;
  private tension: number;
  private mass: number;
  private damping: number;
  private length: number;

  constructor(
    numPoints: number,
    tension: number,
    mass: number,
    damping: number,
    length: number
  ) {
    this.numPoints = numPoints;
    this.tension = tension;
    this.mass = mass;
    this.damping = damping;
    this.length = length;

    this.positions = new Array(numPoints).fill(0);
    this.velocities = new Array(numPoints).fill(0);
  }

  /**
   * Pluck the string at a given position
   */
  pluck(position: number, amplitude: number) {
    const idx = Math.floor(position * (this.numPoints - 1));
    if (idx > 0 && idx < this.numPoints - 1) {
      this.positions[idx] = amplitude;
    }
  }

  /**
   * Drive the string at a specific frequency (for resonance)
   */
  drive(frequency: number, time: number, amplitude: number) {
    const idx = Math.floor(this.numPoints / 4);
    this.positions[idx] += amplitude * Math.sin(2 * Math.PI * frequency * time);
  }

  /**
   * Update the wave simulation
   */
  update(dt: number) {
    const newPositions = [...this.positions];
    const k = this.tension / this.mass; // spring constant
    const dx = this.length / (this.numPoints - 1);

    for (let i = 1; i < this.numPoints - 1; i++) {
      // Wave equation: d²y/dt² = (T/μ) * d²y/dx²
      const d2y_dx2 =
        (this.positions[i + 1] - 2 * this.positions[i] + this.positions[i - 1]) /
        (dx * dx);

      const acceleration = k * d2y_dx2 - this.damping * this.velocities[i];

      this.velocities[i] += acceleration * dt;
      newPositions[i] += this.velocities[i] * dt;
    }

    // Fixed endpoints
    newPositions[0] = 0;
    newPositions[this.numPoints - 1] = 0;

    this.positions = newPositions;
  }

  getPositions(): number[] {
    return this.positions;
  }

  reset() {
    this.positions.fill(0);
    this.velocities.fill(0);
  }

  /**
   * Calculate the fundamental frequency
   */
  getFundamentalFrequency(): number {
    const c = Math.sqrt(this.tension / this.mass); // wave speed
    return c / (2 * this.length);
  }

  /**
   * Get harmonic frequencies
   */
  getHarmonics(n: number): number[] {
    const f0 = this.getFundamentalFrequency();
    return Array.from({ length: n }, (_, i) => (i + 1) * f0);
  }
}

/**
 * Perform simple FFT-like frequency analysis
 * Returns amplitude for each harmonic
 */
export function analyzeHarmonics(
  positions: number[],
  numHarmonics: number
): number[] {
  const harmonics: number[] = [];

  for (let n = 1; n <= numHarmonics; n++) {
    let amplitude = 0;

    for (let i = 0; i < positions.length; i++) {
      const x = i / (positions.length - 1);
      // Project onto sine wave of frequency n
      amplitude += positions[i] * Math.sin(n * Math.PI * x);
    }

    amplitude = Math.abs(amplitude) / positions.length;
    harmonics.push(amplitude);
  }

  return harmonics;
}

/**
 * Calculate node positions for a given harmonic
 */
export function getNodes(harmonic: number, numPoints: number): number[] {
  const nodes: number[] = [];

  for (let i = 0; i <= harmonic; i++) {
    const position = i / harmonic;
    if (position >= 0 && position <= 1) {
      nodes.push(Math.floor(position * (numPoints - 1)));
    }
  }

  return nodes;
}

/**
 * Calculate antinode positions for a given harmonic
 */
export function getAntinodes(harmonic: number, numPoints: number): number[] {
  const antinodes: number[] = [];

  for (let i = 0; i < harmonic; i++) {
    const position = (i + 0.5) / harmonic;
    if (position > 0 && position < 1) {
      antinodes.push(Math.floor(position * (numPoints - 1)));
    }
  }

  return antinodes;
}
