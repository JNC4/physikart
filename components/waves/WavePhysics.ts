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
    // Clamp amplitude to reasonable range
    const clampedAmplitude = Math.max(-50, Math.min(50, amplitude));
    const idx = Math.floor(position * (this.numPoints - 1));
    if (idx > 0 && idx < this.numPoints - 1) {
      // Create a smooth triangular displacement pattern
      for (let i = 1; i < this.numPoints - 1; i++) {
        const distFromPluck = Math.abs(i - idx);
        const leftDist = idx;
        const rightDist = this.numPoints - 1 - idx;

        // Calculate the scale based on which side of pluck point we're on
        let scale = 0;
        if (i <= idx) {
          // Left side of pluck
          scale = i / leftDist;
        } else {
          // Right side of pluck
          scale = (this.numPoints - 1 - i) / rightDist;
        }

        this.positions[i] = clampedAmplitude * scale;
        this.velocities[i] = 0; // Start from rest
      }
    }
  }

  /**
   * Drive the string at a specific frequency (for resonance)
   */
  drive(frequency: number, time: number, amplitude: number) {
    // Apply a gentle sinusoidal force instead of directly setting position
    const drivePoints = [
      Math.floor(this.numPoints / 4),
      Math.floor(this.numPoints / 2),
      Math.floor((3 * this.numPoints) / 4),
    ];

    const force = amplitude * Math.sin(2 * Math.PI * frequency * time);

    drivePoints.forEach((idx) => {
      if (idx > 0 && idx < this.numPoints - 1) {
        // Add velocity instead of forcing position
        this.velocities[idx] += force * 0.02;
      }
    });
  }

  /**
   * Update the wave simulation
   */
  update(dt: number) {
    const newVelocities = [...this.velocities];
    const newPositions = [...this.positions];
    const k = (this.tension / this.mass) * 0.1; // Reduced spring constant for stability
    const dx = this.length / (this.numPoints - 1);

    for (let i = 1; i < this.numPoints - 1; i++) {
      // Wave equation: d²y/dt² = (T/μ) * d²y/dx²
      const d2y_dx2 =
        (this.positions[i + 1] - 2 * this.positions[i] + this.positions[i - 1]) /
        (dx * dx);

      const acceleration = k * d2y_dx2 - this.damping * this.velocities[i] * 20;

      newVelocities[i] = this.velocities[i] + acceleration * dt;
      newPositions[i] = this.positions[i] + newVelocities[i] * dt;

      // Stability check: clamp to reasonable bounds
      if (!isFinite(newPositions[i]) || Math.abs(newPositions[i]) > 500) {
        newPositions[i] = 0;
        newVelocities[i] = 0;
      }

      if (!isFinite(newVelocities[i]) || Math.abs(newVelocities[i]) > 1000) {
        newVelocities[i] = 0;
      }
    }

    // Fixed endpoints
    newPositions[0] = 0;
    newPositions[this.numPoints - 1] = 0;
    newVelocities[0] = 0;
    newVelocities[this.numPoints - 1] = 0;

    this.positions = newPositions;
    this.velocities = newVelocities;
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
      const pos = positions[i];

      // Skip if position is not finite
      if (!isFinite(pos)) continue;

      // Project onto sine wave of frequency n
      amplitude += pos * Math.sin(n * Math.PI * x);
    }

    amplitude = Math.abs(amplitude) / positions.length;

    // Ensure result is finite
    if (!isFinite(amplitude)) {
      amplitude = 0;
    }

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
