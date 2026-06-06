/**
 * Canvas sizing, done once and done right.
 *
 * The old code drew to a fixed 800x600 backing store with a hardcoded origin
 * and no devicePixelRatio handling — blurry on every retina display and
 * unresponsive to layout. Here the backing store always matches the element's
 * real size times the (capped) device pixel ratio.
 */

export interface Size {
  /** CSS pixels — what layout and pointer events speak in. */
  cssWidth: number;
  cssHeight: number;
  /** Backing-store pixels — what the canvas actually rasterises. */
  pixelWidth: number;
  pixelHeight: number;
  dpr: number;
}

export interface FitOptions {
  /** Cap the device pixel ratio. Heavy shader fields don't need 3x. */
  maxDpr?: number;
  /**
   * For 2D contexts: pre-scale the transform so draw code works in CSS pixels.
   * Leave false for WebGL (which uses gl.viewport in device pixels).
   */
  scale2d?: boolean;
}

/**
 * Resize a canvas's backing store to match its laid-out size at the current
 * (capped) DPR. Returns the resolved size, or null if the element has no size
 * yet (e.g. display:none). Cheap to call repeatedly; only touches the DOM when
 * the dimensions actually change.
 */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  opts: FitOptions = {}
): Size | null {
  const { maxDpr = 2, scale2d = false } = opts;
  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.round(rect.width);
  const cssHeight = Math.round(rect.height);
  if (cssWidth === 0 || cssHeight === 0) return null;

  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const pixelWidth = Math.round(cssWidth * dpr);
  const pixelHeight = Math.round(cssHeight * dpr);

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    if (scale2d) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
    }
  }

  return { cssWidth, cssHeight, pixelWidth, pixelHeight, dpr };
}
