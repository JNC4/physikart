/**
 * Double Pendulum simulation using Runge-Kutta 4th order integration
 */
export interface PendulumState {
  theta1: number; // angle of first pendulum
  theta2: number; // angle of second pendulum
  omega1: number; // angular velocity of first pendulum
  omega2: number; // angular velocity of second pendulum
}

export interface PendulumParams {
  L1: number; // length of first pendulum
  L2: number; // length of second pendulum
  m1: number; // mass of first bob
  m2: number; // mass of second bob
  g: number; // gravity
  damping: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculate derivatives for double pendulum using Lagrangian mechanics
 */
function derivatives(
  state: PendulumState,
  params: PendulumParams
): PendulumState {
  const { theta1, theta2, omega1, omega2 } = state;
  const { L1, L2, m1, m2, g, damping } = params;

  const delta = theta2 - theta1;
  const den1 = (m1 + m2) * L1 - m2 * L1 * Math.cos(delta) * Math.cos(delta);
  const den2 = (L2 / L1) * den1;

  const dTheta1 = omega1;
  const dTheta2 = omega2;

  const dOmega1 =
    (m2 * L1 * omega1 * omega1 * Math.sin(delta) * Math.cos(delta) +
      m2 * g * Math.sin(theta2) * Math.cos(delta) +
      m2 * L2 * omega2 * omega2 * Math.sin(delta) -
      (m1 + m2) * g * Math.sin(theta1) -
      damping * omega1) /
    den1;

  const dOmega2 =
    (-m2 * L2 * omega2 * omega2 * Math.sin(delta) * Math.cos(delta) +
      (m1 + m2) * g * Math.sin(theta1) * Math.cos(delta) -
      (m1 + m2) * L1 * omega1 * omega1 * Math.sin(delta) -
      (m1 + m2) * g * Math.sin(theta2) -
      damping * omega2) /
    den2;

  return {
    theta1: dTheta1,
    theta2: dTheta2,
    omega1: dOmega1,
    omega2: dOmega2,
  };
}

/**
 * Runge-Kutta 4th order integration step
 */
export function rk4Step(
  state: PendulumState,
  params: PendulumParams,
  dt: number
): PendulumState {
  const k1 = derivatives(state, params);

  const state2: PendulumState = {
    theta1: state.theta1 + k1.theta1 * dt * 0.5,
    theta2: state.theta2 + k1.theta2 * dt * 0.5,
    omega1: state.omega1 + k1.omega1 * dt * 0.5,
    omega2: state.omega2 + k1.omega2 * dt * 0.5,
  };
  const k2 = derivatives(state2, params);

  const state3: PendulumState = {
    theta1: state.theta1 + k2.theta1 * dt * 0.5,
    theta2: state.theta2 + k2.theta2 * dt * 0.5,
    omega1: state.omega1 + k2.omega1 * dt * 0.5,
    omega2: state.omega2 + k2.omega2 * dt * 0.5,
  };
  const k3 = derivatives(state3, params);

  const state4: PendulumState = {
    theta1: state.theta1 + k3.theta1 * dt,
    theta2: state.theta2 + k3.theta2 * dt,
    omega1: state.omega1 + k3.omega1 * dt,
    omega2: state.omega2 + k3.omega2 * dt,
  };
  const k4 = derivatives(state4, params);

  return {
    theta1:
      state.theta1 +
      (dt / 6) * (k1.theta1 + 2 * k2.theta1 + 2 * k3.theta1 + k4.theta1),
    theta2:
      state.theta2 +
      (dt / 6) * (k1.theta2 + 2 * k2.theta2 + 2 * k3.theta2 + k4.theta2),
    omega1:
      state.omega1 +
      (dt / 6) * (k1.omega1 + 2 * k2.omega1 + 2 * k3.omega1 + k4.omega1),
    omega2:
      state.omega2 +
      (dt / 6) * (k1.omega2 + 2 * k2.omega2 + 2 * k3.omega2 + k4.omega2),
  };
}

/**
 * Calculate Cartesian positions from angles
 */
export function getPositions(
  state: PendulumState,
  params: PendulumParams,
  origin: Point
): { bob1: Point; bob2: Point } {
  const x1 = origin.x + params.L1 * Math.sin(state.theta1);
  const y1 = origin.y + params.L1 * Math.cos(state.theta1);

  const x2 = x1 + params.L2 * Math.sin(state.theta2);
  const y2 = y1 + params.L2 * Math.cos(state.theta2);

  return {
    bob1: { x: x1, y: y1 },
    bob2: { x: x2, y: y2 },
  };
}

/**
 * Calculate total energy (kinetic + potential)
 */
export function calculateEnergy(
  state: PendulumState,
  params: PendulumParams
): { kinetic: number; potential: number; total: number } {
  const { theta1, theta2, omega1, omega2 } = state;
  const { L1, L2, m1, m2, g } = params;

  // Kinetic energy
  const v1Sq = L1 * L1 * omega1 * omega1;
  const v2Sq =
    L1 * L1 * omega1 * omega1 +
    L2 * L2 * omega2 * omega2 +
    2 * L1 * L2 * omega1 * omega2 * Math.cos(theta1 - theta2);

  const kinetic = 0.5 * m1 * v1Sq + 0.5 * m2 * v2Sq;

  // Potential energy (taking pivot as zero)
  const y1 = -L1 * Math.cos(theta1);
  const y2 = y1 - L2 * Math.cos(theta2);

  const potential = m1 * g * y1 + m2 * g * y2;

  return {
    kinetic,
    potential,
    total: kinetic + potential,
  };
}

/**
 * Create multiple pendulums with slight variations
 */
export function createOverlays(
  baseState: PendulumState,
  count: number,
  randomness: number
): PendulumState[] {
  const overlays: PendulumState[] = [baseState];

  for (let i = 1; i < count; i++) {
    const variation = ((i - count / 2) / count) * randomness;
    overlays.push({
      theta1: baseState.theta1 + (variation * Math.PI) / 180,
      theta2: baseState.theta2 + (variation * Math.PI) / 180,
      omega1: baseState.omega1,
      omega2: baseState.omega2,
    });
  }

  return overlays;
}
