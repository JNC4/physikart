/**
 * Chladni figures — a square plate driven into vibration, sand collecting on
 * the nodal lines where the plate is still.
 *
 * The plate has a discrete spectrum of resonant frequencies f(n,m) ∝ n²+m².
 * Drive it at an arbitrary frequency and almost nothing happens — the sand sits
 * in a featureless scatter. Tune onto an eigenfrequency and the whole plate
 * snaps into a symmetric figure. Order does not live in a range here. It lives
 * on a set of isolated points, each a single exact number.
 *
 * The displayed field superposes the mode shapes
 *   φ(n,m) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy)
 * weighted by each mode's resonant response to the drive.
 */

import {
  type GL,
  type Program,
  type Quad,
  bindTarget,
  createProgram,
  createQuad,
  getGL,
} from "./sim/gl";

const FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
const int MAXM = 10;
uniform int u_count;
uniform vec2 u_modes[MAXM];  // (n, m)
uniform float u_amp[MAXM];   // normalised mode amplitudes
uniform float u_res;         // resonance strength, 0..1
uniform float u_time;
const float PI = 3.141592653589793;

float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

void main() {
  vec2 p = v_uv;
  float u = 0.0;
  for (int i = 0; i < MAXM; i++) {
    if (i >= u_count) break;
    float n = u_modes[i].x, m = u_modes[i].y;
    u += u_amp[i] * (cos(n*PI*p.x)*cos(m*PI*p.y) - cos(m*PI*p.x)*cos(n*PI*p.y));
  }
  // Sand gathers where the plate is still (|u| ≈ 0).
  float node = exp(-(u * u) / 0.0022);
  // Off resonance the grains just jitter — an agitated, patternless scatter.
  float jitter = hash(floor(p * 230.0) + floor(u_time * 7.0));
  float scatter = 0.07 + 0.07 * jitter;
  float d = mix(scatter, node, smoothstep(0.10, 0.55, u_res));

  vec3 plate = vec3(0.039, 0.043, 0.051);
  vec3 bone  = vec3(0.913, 0.892, 0.839);
  outColor = vec4(mix(plate, bone, clamp(d, 0.0, 1.0)), 1.0);
}`;

export interface Mode {
  n: number;
  m: number;
  f: number;
}

const BASE = 16;
const GAMMA = 8; // resonance half-width — narrow, so order is hard to stumble into
const MAXM = 10;

/** The plate's spectrum: modes (n<m) up to 6, by eigenfrequency. */
export function chladniSpectrum(): Mode[] {
  const modes: Mode[] = [];
  for (let n = 1; n <= 6; n++) {
    for (let m = n + 1; m <= 6; m++) {
      modes.push({ n, m, f: BASE * (n * n + m * m) });
    }
  }
  return modes.sort((a, b) => a.f - b.f);
}

const SPECTRUM = chladniSpectrum();
export const CHLADNI_EIGEN = SPECTRUM.map((s) => s.f);
export const CHLADNI_MIN = 40;
export const CHLADNI_MAX = 1000;

/** A few clean single-mode figures, reachable exactly. */
export const CHLADNI_PRESETS = [
  { n: 1, m: 2 },
  { n: 2, m: 3 },
  { n: 1, m: 4 },
  { n: 3, m: 4 },
  { n: 3, m: 5 },
  { n: 4, m: 5 },
].map((p) => ({ ...p, f: BASE * (p.n * p.n + p.m * p.m) }));

/** Lorentzian response of every mode to the drive; A is the peak response. */
function response(f: number): { modes: Mode[]; amps: number[]; A: number } {
  const scored = SPECTRUM.map((s) => ({
    s,
    a: 1 / (1 + ((f - s.f) / GAMMA) ** 2),
  }));
  scored.sort((x, y) => y.a - x.a);
  const top = scored.slice(0, MAXM);
  const A = top[0]?.a ?? 0;
  const sum = top.reduce((acc, t) => acc + t.a, 0) || 1;
  return {
    modes: top.map((t) => t.s),
    amps: top.map((t) => t.a / sum),
    A,
  };
}

/** Nearest eigenmode to a drive frequency, for the readout. */
export function nearestMode(f: number): Mode {
  let best = SPECTRUM[0];
  let bestD = Infinity;
  for (const s of SPECTRUM) {
    const d = Math.abs(s.f - f);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

export function chladniResonance(f: number): number {
  return response(f).A;
}

export interface Chladni {
  setFrequency: (f: number) => void;
  frame: (timeSeconds: number) => void;
  dispose: () => void;
}

export function createChladni(canvas: HTMLCanvasElement): Chladni | null {
  const maybeGl = getGL(canvas, { requireFloat: false });
  if (!maybeGl) return null;
  const gl: GL = maybeGl;

  const quad: Quad = createQuad(gl);
  const prog: Program = createProgram(gl, FS);
  let freq = BASE * (2 * 2 + 3 * 3); // open on a clean (2,3) figure

  return {
    setFrequency(f) {
      freq = f;
    },
    frame(t) {
      const { modes, amps, A } = response(freq);
      const modeData = new Float32Array(MAXM * 2);
      const ampData = new Float32Array(MAXM);
      modes.forEach((mode, i) => {
        modeData[i * 2] = mode.n;
        modeData[i * 2 + 1] = mode.m;
        ampData[i] = amps[i];
      });

      prog.use();
      gl.uniform1i(prog.uniform("u_count"), modes.length);
      gl.uniform2fv(prog.uniform("u_modes"), modeData);
      gl.uniform1fv(prog.uniform("u_amp"), ampData);
      gl.uniform1f(prog.uniform("u_res"), A);
      gl.uniform1f(prog.uniform("u_time"), t);
      bindTarget(gl, null);
      quad.draw();
    },
    dispose() {
      quad.dispose();
      gl.deleteProgram(prog.program);
    },
  };
}
