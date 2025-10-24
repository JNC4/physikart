export interface Point {
  x: number;
  y: number;
}

export interface Anchor extends Point {
  id: number;
}

/**
 * Calculate catenary curve points between two anchors
 * y = a * cosh(x/a) + b
 * where a is determined by the chain length and horizontal distance
 */
export function calculateCatenary(
  anchor1: Anchor,
  anchor2: Anchor,
  chainLength: number,
  gravity: number = 1.0
): Point[] {
  const points: Point[] = [];
  const numPoints = 100;

  // Calculate horizontal and vertical distances
  const dx = anchor2.x - anchor1.x;
  const dy = anchor2.y - anchor1.y;
  const horizontalDist = Math.abs(dx);

  // If chain is too short, return straight line
  const minLength = Math.sqrt(dx * dx + dy * dy);
  if (chainLength <= minLength * 1.01) {
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      points.push({
        x: anchor1.x + t * dx,
        y: anchor1.y + t * dy,
      });
    }
    return points;
  }

  // Solve for parameter 'a' using numerical methods
  // The catenary length between two points is: s = 2a * sinh(b/a)
  // where b = dx/2
  const a = solveCatenaryParameter(horizontalDist, chainLength, dy);

  // Generate catenary curve points
  const x0 = Math.min(anchor1.x, anchor2.x);
  const y0 = Math.min(anchor1.y, anchor2.y);

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x = anchor1.x + t * dx;
    const xRel = x - (anchor1.x + anchor2.x) / 2; // Center x

    // Catenary equation
    const y = a * Math.cosh(xRel / a);

    // Adjust for anchor positions
    const yAdjust = y - a * Math.cosh(-dx / (2 * a));
    const finalY = anchor1.y + yAdjust + (t * dy);

    points.push({ x, y: finalY });
  }

  return points;
}

/**
 * Numerically solve for the catenary parameter 'a'
 */
function solveCatenaryParameter(
  horizontalDist: number,
  chainLength: number,
  verticalDist: number
): number {
  let a = horizontalDist / 2;
  const maxIterations = 50;
  const tolerance = 0.001;

  for (let i = 0; i < maxIterations; i++) {
    const b = horizontalDist / 2;
    const sinh = Math.sinh(b / a);
    const cosh = Math.cosh(b / a);

    const f = 2 * a * sinh - chainLength;
    const df = 2 * sinh - (2 * b / a) * cosh;

    const aNew = a - f / df;

    if (Math.abs(aNew - a) < tolerance) {
      return aNew;
    }

    a = aNew;
  }

  return a;
}

/**
 * Calculate parabola points for comparison
 */
export function calculateParabola(
  anchor1: Anchor,
  anchor2: Anchor,
  sag: number
): Point[] {
  const points: Point[] = [];
  const numPoints = 100;

  const dx = anchor2.x - anchor1.x;
  const dy = anchor2.y - anchor1.y;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x = anchor1.x + t * dx;

    // Parabolic sag
    const parabolaY = 4 * sag * t * (1 - t);
    const y = anchor1.y + t * dy + parabolaY;

    points.push({ x, y });
  }

  return points;
}

/**
 * Calculate tension force at a point on the chain
 */
export function calculateTension(
  point: Point,
  nextPoint: Point,
  mass: number,
  gravity: number
): { magnitude: number; angle: number } {
  const dx = nextPoint.x - point.x;
  const dy = nextPoint.y - point.y;
  const angle = Math.atan2(dy, dx);

  // Simplified tension calculation
  const magnitude = mass * gravity * 10;

  return { magnitude, angle };
}
