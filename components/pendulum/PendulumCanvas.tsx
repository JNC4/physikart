"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  PendulumState,
  PendulumParams,
  Point,
  rk4Step,
  getPositions,
  calculateEnergy,
  createOverlays,
} from "./ChaosSimulation";

interface PendulumCanvasProps {
  params: PendulumParams;
  initialState: PendulumState;
  trailLength: number;
  showArms: boolean;
  showTraces: boolean;
  showEnergy: boolean;
  numOverlays: number;
  randomness: number;
}

const PendulumCanvas: React.FC<PendulumCanvasProps> = ({
  params,
  initialState,
  trailLength,
  showArms,
  showTraces,
  showEnergy,
  numOverlays,
  randomness,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const energyCanvasRef = useRef<HTMLCanvasElement>(null);
  const [states, setStates] = useState<PendulumState[]>(() =>
    createOverlays(initialState, numOverlays, randomness)
  );
  const [trails, setTrails] = useState<Point[][]>(() =>
    Array(numOverlays)
      .fill(null)
      .map(() => [])
  );
  const [energyHistory, setEnergyHistory] = useState<
    { kinetic: number; potential: number; total: number }[]
  >([]);
  const animationRef = useRef<number>();

  const origin: Point = useMemo(() => ({ x: 400, y: 150 }), []);

  // Reset when initial state changes
  useEffect(() => {
    const newStates = createOverlays(initialState, numOverlays, randomness);
    setStates(newStates);
    setTrails(
      Array(numOverlays)
        .fill(null)
        .map(() => [])
    );
    setEnergyHistory([]);
  }, [initialState, numOverlays, randomness]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const dt = 0.016; // ~60fps

      // Update all pendulums
      setStates((prevStates) =>
        prevStates.map((state) => rk4Step(state, params, dt))
      );

      // Update trails
      setTrails((prevTrails) =>
        prevTrails.map((trail, idx) => {
          const positions = getPositions(states[idx], params, origin);
          const newTrail = [...trail, positions.bob2];
          if (newTrail.length > trailLength) {
            return newTrail.slice(-trailLength);
          }
          return newTrail;
        })
      );

      // Update energy history (only for first pendulum)
      if (showEnergy) {
        setEnergyHistory((prev) => {
          const energy = calculateEnergy(states[0], params);
          const newHistory = [...prev, energy];
          if (newHistory.length > 200) {
            return newHistory.slice(-200);
          }
          return newHistory;
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [states, params, trailLength, showEnergy, origin]);

  // Draw main canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear with black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all pendulums
    states.forEach((state, idx) => {
      const positions = getPositions(state, params, origin);
      const hue = (idx / states.length) * 360;
      const opacity = numOverlays > 1 ? 0.6 : 1.0;

      // Draw trace
      if (showTraces && trails[idx] && trails[idx].length > 1) {
        ctx.beginPath();
        trails[idx].forEach((point, i) => {
          const trailOpacity = (i / trails[idx].length) * opacity;
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${opacity * 0.8})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw arms
      if (showArms) {
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(positions.bob1.x, positions.bob1.y);
        ctx.lineTo(positions.bob2.x, positions.bob2.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw bobs
        const radius1 = Math.sqrt(params.m1) * 8;
        const radius2 = Math.sqrt(params.m2) * 8;

        ctx.beginPath();
        ctx.arc(positions.bob1.x, positions.bob1.y, radius1, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${opacity})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(positions.bob2.x, positions.bob2.y, radius2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${opacity})`;
        ctx.fill();
      } else if (trails[idx] && trails[idx].length > 0) {
        // Just draw current position as a dot
        const currentPos = trails[idx][trails[idx].length - 1];
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${opacity})`;
        ctx.fill();
      }
    });

    // Draw pivot
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
  }, [states, trails, params, showArms, showTraces, numOverlays, origin]);

  // Draw energy graph
  useEffect(() => {
    if (!showEnergy) return;

    const canvas = energyCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, width, height);

    if (energyHistory.length < 2) return;

    // Find max energy for scaling
    const maxEnergy = Math.max(
      ...energyHistory.map((e) => Math.max(e.kinetic, e.potential, e.total))
    );
    const minEnergy = Math.min(
      ...energyHistory.map((e) => Math.min(e.kinetic, e.potential, e.total))
    );
    const range = maxEnergy - minEnergy || 1;

    const scaleY = (value: number) => {
      return height - ((value - minEnergy) / range) * height * 0.8 - 20;
    };

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (i / 4) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw lines
    const drawLine = (values: number[], color: string) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      values.forEach((value, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = scaleY(value);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    drawLine(
      energyHistory.map((e) => e.kinetic),
      "#00FF00"
    );
    drawLine(
      energyHistory.map((e) => e.potential),
      "#FF0000"
    );
    drawLine(
      energyHistory.map((e) => e.total),
      "#00BFFF"
    );

    // Draw legend
    ctx.font = "12px monospace";
    ctx.fillStyle = "#00FF00";
    ctx.fillText("KE", 10, 20);
    ctx.fillStyle = "#FF0000";
    ctx.fillText("PE", 50, 20);
    ctx.fillStyle = "#00BFFF";
    ctx.fillText("Total", 90, 20);
  }, [energyHistory, showEnergy]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} width={800} height={600} className="w-full" />
      {showEnergy && (
        <canvas
          ref={energyCanvasRef}
          width={800}
          height={150}
          className="w-full mt-2"
        />
      )}
    </div>
  );
};

export default PendulumCanvas;
