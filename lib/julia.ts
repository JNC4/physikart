/**
 * Julia sets of z → z² + c.
 *
 * One number, c, decides everything. Iterate z² + c from each point of the
 * plane; the points that never run away form the Julia set. And there is a
 * theorem with a knife-edge in it: that set is a single connected whole exactly
 * when c lies in the Mandelbrot set, and a cloud of disconnected dust the
 * instant c steps outside it. The form does not bend into another form at the
 * boundary. It shatters. Along the real axis the break is at exactly c = ¼.
 *
 * Rendered by escape time, drawn as an engraving: a solid landmass for the set,
 * fine contour lines of equal escape outside it. The detail does not end with
 * zoom — every scale is written by the same one line of arithmetic.
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
uniform vec2 u_c;
uniform vec2 u_center;
uniform float u_scale;   // half-height of the view, in the complex plane
uniform float u_aspect;  // width / height
uniform int u_iter;

void main() {
  vec2 uv = v_uv - 0.5;
  vec2 z = u_center + vec2(uv.x * u_aspect, uv.y) * (2.0 * u_scale);
  bool escaped = false;
  float mu = 0.0;
  const int CAP = 600;
  for (int k = 0; k < CAP; k++) {
    if (k >= u_iter) break;
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + u_c;
    float r2 = dot(z, z);
    if (r2 > 256.0) {
      escaped = true;
      mu = float(k) + 1.0 - log2(0.5 * log2(r2));
      break;
    }
  }

  vec3 plate = vec3(0.039, 0.043, 0.051);
  vec3 bone  = vec3(0.913, 0.892, 0.839);

  if (!escaped) {
    outColor = vec4(bone * 0.9, 1.0); // the set itself — solid
  } else {
    float fade = exp(-mu * 0.055);              // brighter near the boundary
    float saw = abs(fract(mu * 0.5) - 0.5) * 2.0;
    float line = smoothstep(0.0, 0.10, saw);     // thin dark contour lines
    vec3 col = mix(plate, bone, fade * 0.82);
    col *= mix(0.5, 1.0, line);
    outColor = vec4(col, 1.0);
  }
}`;

export interface JuliaView {
  cx: number;
  cy: number;
  scale: number;
}

export interface Julia {
  setC: (re: number, im: number) => void;
  setView: (v: JuliaView) => void;
  setAspect: (a: number) => void;
  frame: () => void;
  dispose: () => void;
}

export function createJulia(canvas: HTMLCanvasElement): Julia | null {
  const maybeGl = getGL(canvas, { requireFloat: false });
  if (!maybeGl) return null;
  const gl: GL = maybeGl;

  const quad: Quad = createQuad(gl);
  const prog: Program = createProgram(gl, FS);

  const c: [number, number] = [-0.4, 0.6];
  let view: JuliaView = { cx: 0, cy: 0, scale: 1.4 };
  let aspect = 1;

  return {
    setC(re, im) {
      c[0] = re;
      c[1] = im;
    },
    setView(v) {
      view = v;
    },
    setAspect(a) {
      aspect = a;
    },
    frame() {
      // More iterations as we zoom in, so deep detail keeps resolving.
      const iter = Math.min(
        600,
        Math.round(160 + 90 * Math.max(0, Math.log2(1.4 / view.scale)))
      );
      prog.use();
      gl.uniform2f(prog.uniform("u_c"), c[0], c[1]);
      gl.uniform2f(prog.uniform("u_center"), view.cx, view.cy);
      gl.uniform1f(prog.uniform("u_scale"), view.scale);
      gl.uniform1f(prog.uniform("u_aspect"), aspect);
      gl.uniform1i(prog.uniform("u_iter"), iter);
      bindTarget(gl, null);
      quad.draw();
    },
    dispose() {
      quad.dispose();
      gl.deleteProgram(prog.program);
    },
  };
}

/**
 * Exact test of the knife-edge: is the Julia set connected? It is iff c lies in
 * the Mandelbrot set — iff the orbit of 0 under z² + c never escapes.
 */
export function juliaConnected(re: number, im: number): boolean {
  let zr = 0;
  let zi = 0;
  // A generous cap: near the boundary of M the orbit can wander for hundreds of
  // steps before escaping, and a short cap would call escaping points connected.
  // This exceeds the shader's iteration budget, so the readout never contradicts
  // the image.
  for (let i = 0; i < 1000; i++) {
    const nzr = zr * zr - zi * zi + re;
    const nzi = 2 * zr * zi + im;
    zr = nzr;
    zi = nzi;
    if (zr * zr + zi * zi > 4) return false;
  }
  return true;
}

/**
 * Famous parameters, each a different country. The topology each produces is
 * verified against the Mandelbrot test above: the first four and "spiral" lie
 * inside M (connected); "dust" lies outside it (a true Cantor dust).
 */
export const JULIA_PRESETS: { name: string; re: number; im: number }[] = [
  { name: "near-circle", re: -0.4, im: 0.0 },
  { name: "San Marco", re: -0.75, im: 0.0 },
  { name: "rabbit", re: -0.122, im: 0.745 },
  { name: "dendrite", re: 0.0, im: 1.0 },
  { name: "spiral", re: -0.390541, im: -0.586788 }, // Siegel disk: a connected spiral
  { name: "dust", re: 0.3, im: 0.6 }, // outside M: disconnected
];
