/**
 * Gray–Scott reaction–diffusion on the GPU.
 *
 *   ∂U/∂t = Du ∇²U − U V² + f (1 − U)
 *   ∂V/∂t = Dv ∇²V + U V² − (f + k) V
 *
 * Two chemicals on a square lattice. The whole of biology's worth of pattern —
 * spots, stripes, coral, fingerprints, dividing cells — lives in a thin curved
 * band of the (feed, kill) plane. Step a hair outside it and the field decays
 * to a uniform, featureless death. We don't assert that; the PDE does it.
 *
 * Stored in RG of an RGBA16F ping-pong pair: R = U, G = V.
 */

import {
  type GL,
  type PingPong,
  type Program,
  type Quad,
  bindTarget,
  bindTexture,
  createPingPong,
  createProgram,
  createQuad,
  getGL,
} from "./sim/gl";

const UPDATE_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_field;
uniform vec2 u_texel;
uniform float u_f, u_k, u_du, u_dv, u_dt;

vec2 laplacian() {
  vec2 s = texture(u_field, v_uv).xy * -1.0;
  s += texture(u_field, v_uv + vec2(-u_texel.x, 0.0)).xy * 0.2;
  s += texture(u_field, v_uv + vec2( u_texel.x, 0.0)).xy * 0.2;
  s += texture(u_field, v_uv + vec2(0.0, -u_texel.y)).xy * 0.2;
  s += texture(u_field, v_uv + vec2(0.0,  u_texel.y)).xy * 0.2;
  s += texture(u_field, v_uv + vec2(-u_texel.x, -u_texel.y)).xy * 0.05;
  s += texture(u_field, v_uv + vec2( u_texel.x, -u_texel.y)).xy * 0.05;
  s += texture(u_field, v_uv + vec2(-u_texel.x,  u_texel.y)).xy * 0.05;
  s += texture(u_field, v_uv + vec2( u_texel.x,  u_texel.y)).xy * 0.05;
  return s;
}

void main() {
  vec2 c = texture(u_field, v_uv).xy;
  float U = c.x, V = c.y;
  vec2 L = laplacian();
  float reaction = U * V * V;
  U += (u_du * L.x - reaction + u_f * (1.0 - U)) * u_dt;
  V += (u_dv * L.y + reaction - (u_f + u_k) * V) * u_dt;
  outColor = vec4(clamp(U, 0.0, 1.0), clamp(V, 0.0, 1.0), 0.0, 1.0);
}`;

const SEED_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_field;
uniform vec2 u_point;   // uv, origin bottom-left
uniform float u_radius;
void main() {
  vec2 c = texture(u_field, v_uv).xy;
  float d = distance(v_uv, u_point);
  if (d < u_radius) c = vec2(0.25, 0.5);
  outColor = vec4(c, 0.0, 1.0);
}`;

// Reset to U=1, V=0 with a scatter of seed discs (positions from JS via uniforms).
const RESET_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform vec2 u_seeds[12];
uniform int u_count;
uniform float u_radius;
void main() {
  vec2 c = vec2(1.0, 0.0);
  for (int i = 0; i < 12; i++) {
    if (i >= u_count) break;
    if (distance(v_uv, u_seeds[i]) < u_radius) c = vec2(0.25, 0.5);
  }
  outColor = vec4(c, 0.0, 1.0);
}`;

// Display: a luminous photographic plate. Duotone (plate-black → bone), with a
// whisper of red pencil along the membrane's leading edge. No rainbow.
const DISPLAY_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_field;
void main() {
  float v = texture(u_field, v_uv).y;
  float s = smoothstep(0.16, 0.34, v);
  vec3 plate = vec3(0.039, 0.043, 0.051);
  vec3 bone  = vec3(0.913, 0.892, 0.839);
  vec3 col = mix(plate, bone, s);
  float edge = smoothstep(0.20, 0.26, v) * (1.0 - smoothstep(0.26, 0.34, v));
  col = mix(col, vec3(0.722, 0.251, 0.165), edge * 0.30);
  outColor = vec4(col, 1.0);
}`;

export interface RDParams {
  f: number;
  k: number;
  du: number;
  dv: number;
}

export interface ReactionDiffusion {
  setParams: (p: Partial<RDParams>) => void;
  seed: (uvx: number, uvy: number, radius?: number) => void;
  reset: () => void;
  setStepsPerFrame: (n: number) => void;
  frame: () => void;
  dispose: () => void;
}

const RES = 384;

export function createReactionDiffusion(
  canvas: HTMLCanvasElement
): ReactionDiffusion | null {
  const maybeGl = getGL(canvas);
  if (!maybeGl) return null;
  const gl: GL = maybeGl; // non-null binding the nested closures can rely on

  const quad: Quad = createQuad(gl);
  const update: Program = createProgram(gl, UPDATE_FS);
  const seedProg: Program = createProgram(gl, SEED_FS);
  const resetProg: Program = createProgram(gl, RESET_FS);
  const display: Program = createProgram(gl, DISPLAY_FS);
  // Linear sampling smooths the upscaled display, but half-float linear filtering
  // isn't guaranteed — fall back to nearest where the extension is absent.
  const linear = !!gl.getExtension("OES_texture_float_linear");
  const field: PingPong = createPingPong(
    gl,
    RES,
    RES,
    linear ? gl.LINEAR : gl.NEAREST
  );

  const params: RDParams = { f: 0.0367, k: 0.0649, du: 0.16, dv: 0.08 };
  let stepsPerFrame = 14;
  const texel: [number, number] = [1 / RES, 1 / RES];

  // Pending seed injections from the pointer, drained each frame.
  const pending: { x: number; y: number; r: number }[] = [];

  function runReset() {
    // A ring of seeds plus a centre, deterministic but organic enough.
    const seeds: number[] = [];
    const n = 7;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      seeds.push(0.5 + 0.22 * Math.cos(a), 0.5 + 0.22 * Math.sin(a));
    }
    seeds.push(0.5, 0.5);
    const count = seeds.length / 2;

    resetProg.use();
    gl.uniform2fv(resetProg.uniform("u_seeds"), new Float32Array(seeds));
    gl.uniform1i(resetProg.uniform("u_count"), count);
    gl.uniform1f(resetProg.uniform("u_radius"), 0.025);
    bindTarget(gl, field.read);
    quad.draw();
    bindTarget(gl, null);
  }

  function applySeed(x: number, y: number, r: number) {
    seedProg.use();
    gl.uniform1i(seedProg.uniform("u_field"), bindTexture(gl, field.read.tex, 0));
    gl.uniform2f(seedProg.uniform("u_point"), x, y);
    gl.uniform1f(seedProg.uniform("u_radius"), r);
    bindTarget(gl, field.write);
    quad.draw();
    field.swap();
  }

  function stepOnce() {
    update.use();
    gl.uniform1i(update.uniform("u_field"), bindTexture(gl, field.read.tex, 0));
    gl.uniform2f(update.uniform("u_texel"), texel[0], texel[1]);
    gl.uniform1f(update.uniform("u_f"), params.f);
    gl.uniform1f(update.uniform("u_k"), params.k);
    gl.uniform1f(update.uniform("u_du"), params.du);
    gl.uniform1f(update.uniform("u_dv"), params.dv);
    gl.uniform1f(update.uniform("u_dt"), 1.0);
    bindTarget(gl, field.write);
    quad.draw();
    field.swap();
  }

  runReset();

  return {
    setParams(p) {
      Object.assign(params, p);
    },
    seed(x, y, r = 0.03) {
      pending.push({ x, y, r });
    },
    reset() {
      runReset();
    },
    setStepsPerFrame(n) {
      stepsPerFrame = Math.max(1, Math.min(40, Math.round(n)));
    },
    frame() {
      gl.disable(gl.BLEND);
      let s;
      while ((s = pending.shift())) applySeed(s.x, s.y, s.r);
      for (let i = 0; i < stepsPerFrame; i++) stepOnce();

      display.use();
      gl.uniform1i(display.uniform("u_field"), bindTexture(gl, field.read.tex, 0));
      bindTarget(gl, null);
      quad.draw();
    },
    dispose() {
      field.dispose();
      quad.dispose();
      [update, seedProg, resetProg, display].forEach((p) =>
        gl.deleteProgram(p.program)
      );
    },
  };
}

/**
 * Where order survives. Approximate projections of the living band of the
 * (feed, kill) plane — used to shade the dials and to name the regime. The
 * plate is the real witness; these are the cartographer's pencilled bounds.
 */
export const ALIVE_FEED = { lo: 0.01, hi: 0.09 };
export const ALIVE_KILL = { lo: 0.045, hi: 0.07 };

/** A few celebrated living configurations, each with its character. */
export const RD_PRESETS: { name: string; f: number; k: number }[] = [
  { name: "coral", f: 0.0545, k: 0.062 },
  { name: "mitosis", f: 0.0367, k: 0.0649 },
  { name: "fingerprints", f: 0.0376, k: 0.0606 },
  { name: "solitons", f: 0.03, k: 0.0625 },
  { name: "worms", f: 0.058, k: 0.065 },
];

/** A coarse, honest verdict for the readout: is this configuration alive? */
export function rdRegime(f: number, k: number): { alive: boolean; name: string } {
  const inBand =
    f >= ALIVE_FEED.lo &&
    f <= ALIVE_FEED.hi &&
    k >= ALIVE_KILL.lo &&
    k <= ALIVE_KILL.hi &&
    // the living region is a curved sliver, not the bounding box. The upper
    // wall is drawn to enclose the named presets, worms (0.058, 0.065) included.
    k > 0.035 + 0.32 * f &&
    k < 0.0735 - 0.26 * Math.max(0, f - 0.03);
  if (!inBand) {
    return { alive: false, name: f < 0.02 ? "uniform decay" : "uniform death" };
  }
  let best = RD_PRESETS[0];
  let bestD = Infinity;
  for (const p of RD_PRESETS) {
    const d = (p.f - f) ** 2 + (p.k - k) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return { alive: true, name: best.name };
}
