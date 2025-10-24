"use client";

import { useEffect, useRef, useState } from "react";
import {
  Circle,
  Point,
  calculateAllPositions,
  updateCircles,
} from "./OrbitMath";

interface EpicycleCanvasProps {
  circles: Circle[];
  trailLength: number;
  showCircles: boolean;
  showCenters: boolean;
  showRadii: boolean;
  showVelocity: boolean;
}

const EpicycleCanvas: React.FC<EpicycleCanvasProps> = ({
  circles: initialCircles,
  trailLength,
  showCircles,
  showCenters,
  showRadii,
  showVelocity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [circles, setCircles] = useState<Circle[]>(initialCircles);
  const [trail, setTrail] = useState<Point[]>([]);
  const [time, setTime] = useState(0);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  // Reset when initial circles change
  useEffect(() => {
    setCircles(initialCircles);
    setTrail([]);
    setTime(0);
  }, [initialCircles]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Update time
      setTime((t) => t + deltaTime);

      // Update circles
      setCircles((prevCircles) => updateCircles(prevCircles, deltaTime));

      // Calculate current position and add to trail
      const positions = calculateAllPositions(circles, time);
      const currentPos = positions[positions.length - 1];

      setTrail((prevTrail) => {
        const newTrail = [...prevTrail, currentPos];
        if (newTrail.length > trailLength) {
          return newTrail.slice(-trailLength);
        }
        return newTrail;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [circles, time, trailLength]);

  // Draw simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with deep space background
    ctx.fillStyle = "#0D1117";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw trail with fading effect
    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const alpha = i / trail.length;
        const hue = (i / trail.length) * 60 + 180; // Cyan to blue

        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${alpha * 0.8})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw bright point at current position
      const currentPos = trail[trail.length - 1];
      ctx.beginPath();
      ctx.arc(currentPos.x, currentPos.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#00FFFF";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00FFFF";
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Calculate all current positions
    const positions = calculateAllPositions(circles, time);

    // Draw circles
    if (showCircles) {
      positions.slice(0, -1).forEach((pos, idx) => {
        const circle = circles[idx];
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, circle.radius, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 0 ? "rgba(74, 144, 226, 0.3)" : "rgba(80, 227, 194, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Draw radii lines
    if (showRadii) {
      for (let i = 0; i < positions.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(positions[i].x, positions[i].y);
        ctx.lineTo(positions[i + 1].x, positions[i + 1].y);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw center points
    if (showCenters) {
      positions.forEach((pos, idx) => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? "#FFD700" : "#FFFFFF";
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 8;
        ctx.shadowColor = idx === 0 ? "#FFD700" : "#FFFFFF";
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    // Draw velocity vector
    if (showVelocity && trail.length > 2) {
      const currentPos = trail[trail.length - 1];
      const prevPos = trail[trail.length - 2];
      const dx = currentPos.x - prevPos.x;
      const dy = currentPos.y - prevPos.y;
      const mag = Math.sqrt(dx * dx + dy * dy);

      if (mag > 0) {
        const scale = 20;
        const endX = currentPos.x + (dx / mag) * scale;
        const endY = currentPos.y + (dy / mag) * scale;

        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(currentPos.x, currentPos.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = "#FF00FF";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Arrowhead
        const headLength = 6;
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headLength * Math.cos(angle - Math.PI / 6),
          endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - headLength * Math.cos(angle + Math.PI / 6),
          endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = "#FF00FF";
        ctx.fill();
      }
    }
  }, [circles, trail, time, showCircles, showCenters, showRadii, showVelocity]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="w-full h-full"
    />
  );
};

export default EpicycleCanvas;
