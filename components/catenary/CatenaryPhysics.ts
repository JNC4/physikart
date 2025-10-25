export interface Point {
  x: number;
  y: number;
}

export interface Anchor extends Point {
  id: number;
}

/**
 * Calculate catenary curve points between two anchors
 *
 * The catenary equation is: y = a * cosh(x/a) + c
 *
 * For a hanging chain:
 * - Chain hangs DOWNWARD from anchors (positive y is down in screen coordinates)
 * - The sag increases with chain length
 * - Parameter 'a' controls the shape (smaller a = more sag)
 */
export function calculateCatenary(
  anchor1: Anchor,
  anchor2: Anchor,
  chainLength: number,
  gravity: number = 1.0
): Point[] {
  const points: Point[] = [];
  const numPoints = 100;

  // Calculate distances
  const dx = anchor2.x - anchor1.x;
  const dy = anchor2.y - anchor1.y;
  const horizontalDist = Math.abs(dx);
  const straightLineDist = Math.sqrt(dx * dx + dy * dy);

  // If chain is too short to sag, return straight line
  if (chainLength <= straightLineDist * 1.001) {
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      points.push({
        x: anchor1.x + t * dx,
        y: anchor1.y + t * dy,
      });
    }
    return points;
  }

  // Handle symmetric case (anchors at same height)
  if (Math.abs(dy) < 1) {
    return calculateSymmetricCatenary(anchor1, anchor2, chainLength, numPoints);
  }

  // Handle asymmetric case
  return calculateAsymmetricCatenary(anchor1, anchor2, chainLength, numPoints);
}

/**
 * Calculate symmetric catenary (anchors at same height)
 * This is the classic hanging chain problem
 */
function calculateSymmetricCatenary(
  anchor1: Anchor,
  anchor2: Anchor,
  chainLength: number,
  numPoints: number
): Point[] {
  const points: Point[] = [];
  const dx = anchor2.x - anchor1.x;
  const horizontalDist = Math.abs(dx);

  // Solve for parameter 'a'
  const a = solveCatenaryParameterSymmetric(horizontalDist, chainLength);

  const midX = (anchor1.x + anchor2.x) / 2;
  const b = horizontalDist / 2;

  // The catenary equation is y = a * cosh(x/a) + c
  // At the anchor points (x = ±b), we have: anchor1.y = a * cosh(b/a) + c
  // Solving for c: c = anchor1.y - a * cosh(b/a)
  const y_anchor_catenary = a * Math.cosh(b / a);
  const c = anchor1.y - y_anchor_catenary;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x = anchor1.x + t * dx;
    const xLocal = x - midX; // x relative to center

    const y = a * Math.cosh(xLocal / a) + c;

    points.push({ x, y });
  }

  return points;
}

/**
 * Calculate asymmetric catenary (anchors at different heights)
 */
function calculateAsymmetricCatenary(
  anchor1: Anchor,
  anchor2: Anchor,
  chainLength: number,
  numPoints: number
): Point[] {
  const points: Point[] = [];
  const dx = anchor2.x - anchor1.x;
  const dy = anchor2.y - anchor1.y;
  const horizontalDist = Math.abs(dx);

  // For asymmetric catenary, we need to find both 'a' and the x-offset
  // This requires solving:
  // 1. The chain length equation
  // 2. The end height constraint
  const { a, x1, x2 } = solveCatenaryParameterAsymmetric(
    horizontalDist,
    dy,
    chainLength
  );

  // Find vertical offset to match anchor1
  const y1_catenary = a * Math.cosh(x1 / a);
  const c = anchor1.y - y1_catenary;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x = anchor1.x + t * dx;
    const xLocal = x1 + t * (x2 - x1);

    const y = a * Math.cosh(xLocal / a) + c;

    points.push({ x, y });
  }

  return points;
}

/**
 * Solve for catenary parameter 'a' in symmetric case
 * Equation: L = 2a * sinh(b/a), where b = horizontalDist/2
 */
function solveCatenaryParameterSymmetric(
  horizontalDist: number,
  chainLength: number
): number {
  const b = horizontalDist / 2;

  // Initial guess
  let a = horizontalDist / 2;

  // Newton-Raphson iteration
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    const ratio = b / a;
    const sinhVal = Math.sinh(ratio);
    const coshVal = Math.cosh(ratio);

    // f(a) = 2a * sinh(b/a) - L
    const f = 2 * a * sinhVal - chainLength;

    // f'(a) = 2 * sinh(b/a) - 2b/a * cosh(b/a)
    const df = 2 * sinhVal - (2 * b / a) * coshVal;

    if (Math.abs(df) < 1e-10) break;

    const aNew = a - f / df;

    // Ensure a stays positive and reasonable
    if (aNew <= 0 || aNew > horizontalDist * 100) break;
    if (Math.abs(aNew - a) < tolerance) return aNew;

    a = aNew;
  }

  return a;
}

/**
 * Solve for catenary parameters in asymmetric case
 * This is more complex and requires solving a system of equations
 */
function solveCatenaryParameterAsymmetric(
  horizontalDist: number,
  verticalDist: number,
  chainLength: number
): { a: number; x1: number; x2: number } {
  // Start with symmetric solution as initial guess
  let a = solveCatenaryParameterSymmetric(horizontalDist, chainLength);

  // Use iterative method to find x1 and x2 such that:
  // 1. x2 - x1 = horizontalDist
  // 2. a * (cosh(x2/a) - cosh(x1/a)) = verticalDist
  // 3. a * (sinh(x2/a) - sinh(x1/a)) = chainLength

  let x1 = -horizontalDist / 2;
  let x2 = horizontalDist / 2;

  const maxIterations = 50;
  const tolerance = 0.01;

  for (let i = 0; i < maxIterations; i++) {
    const cosh1 = Math.cosh(x1 / a);
    const cosh2 = Math.cosh(x2 / a);
    const sinh1 = Math.sinh(x1 / a);
    const sinh2 = Math.sinh(x2 / a);

    const currentVerticalDist = a * (cosh2 - cosh1);
    const currentLength = a * (sinh2 - sinh1);

    const vertError = currentVerticalDist - verticalDist;
    const lengthError = currentLength - chainLength;

    if (Math.abs(vertError) < tolerance && Math.abs(lengthError) < tolerance) {
      break;
    }

    // Adjust parameters
    // If chain is too long, decrease a (more sag)
    // If vertical distance is wrong, adjust x1
    a -= lengthError * 0.1;
    x1 -= vertError * 0.01;
    x2 = x1 + horizontalDist;

    // Keep a positive and reasonable
    a = Math.max(10, Math.min(a, horizontalDist * 10));
  }

  return { a, x1, x2 };
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

    // Parabolic sag: peaks at t=0.5
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

  // Tension magnitude depends on the slope
  const slopeAngle = Math.atan2(dy, dx);
  const baselineTension = mass * gravity * 5;
  const magnitude = baselineTension / Math.max(Math.abs(Math.cos(slopeAngle)), 0.1);

  return { magnitude, angle };
}

/**
 * Validate catenary curve by computing its actual length
 */
export function validateCatenaryLength(points: Point[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}
