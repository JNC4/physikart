/**
 * A small, owned WebGL2 helper — just enough for fullscreen fragment passes
 * and ping-pong float fields. No dependency; everything here is transparent.
 *
 * Targets WebGL2 (core float textures, VAOs) and enables EXT_color_buffer_float
 * so we can render into RGBA16F. Half-float carries Gray-Scott concentrations
 * cleanly; 8-bit would quantise the reaction into banding and stall it.
 */

export type GL = WebGL2RenderingContext;

/** Acquire a WebGL2 context. Screen-only shaders don't need float framebuffers. */
export function getGL(
  canvas: HTMLCanvasElement,
  opts: { requireFloat?: boolean } = {}
): GL | null {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    premultipliedAlpha: false,
  }) as GL | null;
  if (!gl) return null;
  // Renderable half-float color attachments — required only for ping-pong fields.
  if ((opts.requireFloat ?? true) && !gl.getExtension("EXT_color_buffer_float")) {
    return null;
  }
  return gl;
}

function compile(gl: GL, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader compile failed: ${log}\n${src}`);
  }
  return shader;
}

export interface Program {
  program: WebGLProgram;
  /** Cached uniform location lookup. */
  uniform: (name: string) => WebGLUniformLocation | null;
  use: () => void;
}

/** The shared fullscreen vertex shader: a clip-space triangle pair + uv. */
const QUAD_VS = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

export function createProgram(gl: GL, fs: string, vs: string = QUAD_VS): Program {
  const program = gl.createProgram()!;
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  gl.attachShader(program, v);
  gl.attachShader(program, f);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    throw new Error(`program link failed: ${log}`);
  }
  gl.deleteShader(v);
  gl.deleteShader(f);

  const cache = new Map<string, WebGLUniformLocation | null>();
  return {
    program,
    use: () => gl.useProgram(program),
    uniform: (name: string) => {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
      return cache.get(name)!;
    },
  };
}

/** A fullscreen quad as a VAO. Call draw() after binding a program. */
export interface Quad {
  draw: () => void;
  dispose: () => void;
}

export function createQuad(gl: GL): Quad {
  const vao = gl.createVertexArray()!;
  const buf = gl.createBuffer()!;
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  // Two triangles covering clip space.
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  return {
    draw: () => {
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    },
    dispose: () => {
      gl.deleteVertexArray(vao);
      gl.deleteBuffer(buf);
    },
  };
}

/** A render target: an RGBA16F texture with its framebuffer. */
export interface Target {
  fbo: WebGLFramebuffer;
  tex: WebGLTexture;
  width: number;
  height: number;
}

export function createTarget(
  gl: GL,
  width: number,
  height: number,
  filter: number = gl.NEAREST
): Target {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA16F,
    width,
    height,
    0,
    gl.RGBA,
    gl.HALF_FLOAT,
    null
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    tex,
    0
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return { fbo, tex, width, height };
}

/** A ping-pong pair: read the current field, write the next, then swap. */
export interface PingPong {
  read: Target;
  write: Target;
  swap: () => void;
  dispose: () => void;
}

export function createPingPong(
  gl: GL,
  width: number,
  height: number,
  filter: number = gl.NEAREST
): PingPong {
  let a = createTarget(gl, width, height, filter);
  let b = createTarget(gl, width, height, filter);
  const pp: PingPong = {
    get read() {
      return a;
    },
    get write() {
      return b;
    },
    swap() {
      const t = a;
      a = b;
      b = t;
    },
    dispose() {
      [a, b].forEach((t) => {
        gl.deleteFramebuffer(t.fbo);
        gl.deleteTexture(t.tex);
      });
    },
  } as PingPong;
  return pp;
}

/** Bind a target (or the screen, when null) as the draw destination. */
export function bindTarget(gl: GL, target: Target | null) {
  if (target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, target.width, target.height);
  } else {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }
}

/** Bind a texture to a unit and return the unit index (for a sampler uniform). */
export function bindTexture(gl: GL, tex: WebGLTexture, unit: number): number {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  return unit;
}
