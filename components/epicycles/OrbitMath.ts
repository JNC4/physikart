export interface Circle {
  x: number;
  y: number;
  radius: number;
  speed: number; // rotations per second
  angle: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculate the position of a point on an epicycle system
 */
export function calculateEpicyclePosition(
  circles: Circle[],
  time: number
): Point {
  let x = circles[0].x;
  let y = circles[0].y;

  for (let i = 0; i < circles.length; i++) {
    const circle = circles[i];
    const angle = circle.angle + circle.speed * time;

    if (i === 0) {
      // First circle (deferent)
      x += circle.radius * Math.cos(angle);
      y += circle.radius * Math.sin(angle);
    } else {
      // Subsequent circles (epicycles)
      x += circle.radius * Math.cos(angle);
      y += circle.radius * Math.sin(angle);
    }
  }

  return { x, y };
}

/**
 * Update circle angles based on time
 */
export function updateCircles(circles: Circle[], deltaTime: number): Circle[] {
  return circles.map((circle) => ({
    ...circle,
    angle: circle.angle + circle.speed * deltaTime,
  }));
}

/**
 * Create preset orbit configurations
 */
export const presets = {
  simpleCircle: (): Circle[] => [
    { x: 400, y: 300, radius: 150, speed: 1, angle: 0 },
  ],

  ellipse: (): Circle[] => [
    { x: 400, y: 300, radius: 120, speed: 1, angle: 0 },
    { x: 0, y: 0, radius: 30, speed: 1, angle: Math.PI },
  ],

  retrogradeMars: (): Circle[] => [
    { x: 400, y: 300, radius: 100, speed: 1, angle: 0 },
    { x: 0, y: 0, radius: 40, speed: -3, angle: 0 },
  ],

  moonSystem: (): Circle[] => [
    { x: 400, y: 300, radius: 150, speed: 0.5, angle: 0 }, // Earth orbit
    { x: 0, y: 0, radius: 30, speed: 5, angle: 0 }, // Moon orbit
  ],

  flower: (): Circle[] => [
    { x: 400, y: 300, radius: 100, speed: 1, angle: 0 },
    { x: 0, y: 0, radius: 60, speed: 3, angle: 0 },
    { x: 0, y: 0, radius: 30, speed: -2, angle: 0 },
  ],

  spirograph: (): Circle[] => [
    { x: 400, y: 300, radius: 120, speed: 1, angle: 0 },
    { x: 0, y: 0, radius: 70, speed: 3, angle: 0 },
    { x: 0, y: 0, radius: 40, speed: -5, angle: 0 },
    { x: 0, y: 0, radius: 20, speed: 7, angle: 0 },
  ],
};

/**
 * Calculate all positions in the epicycle chain
 */
export function calculateAllPositions(
  circles: Circle[],
  time: number
): Point[] {
  const positions: Point[] = [];
  let x = circles[0].x;
  let y = circles[0].y;

  positions.push({ x, y });

  for (let i = 0; i < circles.length; i++) {
    const circle = circles[i];
    const angle = circle.angle + circle.speed * time;

    x += circle.radius * Math.cos(angle);
    y += circle.radius * Math.sin(angle);

    positions.push({ x, y });
  }

  return positions;
}
