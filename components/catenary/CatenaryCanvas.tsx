"use client";

import { useEffect, useRef, useState } from "react";
import {
  Anchor,
  Point,
  calculateCatenary,
  calculateParabola,
  calculateTension,
} from "./CatenaryPhysics";

interface CatenaryCanvasProps {
  chainLength: number;
  gravity: number;
  chainMass: number;
  showTension: boolean;
  showEquation: boolean;
  showParabola: boolean;
  mode: "chain" | "arch" | "bridge";
}

const CatenaryCanvas: React.FC<CatenaryCanvasProps> = ({
  chainLength,
  gravity,
  chainMass,
  showTension,
  showEquation,
  showParabola,
  mode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [anchors, setAnchors] = useState<Anchor[]>([
    { id: 1, x: 150, y: 200 },
    { id: 2, x: 650, y: 200 },
  ]);
  const [draggingAnchor, setDraggingAnchor] = useState<number | null>(null);

  // Handle mouse/touch events
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing anchor
    const clickedAnchor = anchors.find(
      (anchor) => Math.hypot(anchor.x - x, anchor.y - y) < 15
    );

    if (clickedAnchor) {
      setDraggingAnchor(clickedAnchor.id);
    } else if (e.button === 0) {
      // Left click - add new anchor
      const newAnchor: Anchor = {
        id: Date.now(),
        x,
        y,
      };
      setAnchors([...anchors, newAnchor]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggingAnchor === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setAnchors((prev) =>
      prev.map((anchor) =>
        anchor.id === draggingAnchor ? { ...anchor, x, y } : anchor
      )
    );
  };

  const handlePointerUp = () => {
    setDraggingAnchor(null);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Remove anchor if right-clicked
    const clickedAnchor = anchors.find(
      (anchor) => Math.hypot(anchor.x - x, anchor.y - y) < 15
    );

    if (clickedAnchor && anchors.length > 2) {
      setAnchors((prev) => prev.filter((a) => a.id !== clickedAnchor.id));
    }
  };

  // Draw simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = mode === "chain" ? "#F5F5F5" : "#E8E4DC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sort anchors by x position for drawing chains
    const sortedAnchors = [...anchors].sort((a, b) => a.x - b.x);

    // Draw chains between consecutive anchors
    for (let i = 0; i < sortedAnchors.length - 1; i++) {
      const anchor1 = sortedAnchors[i];
      const anchor2 = sortedAnchors[i + 1];

      // Calculate catenary
      const catenaryPoints = calculateCatenary(
        anchor1,
        anchor2,
        chainLength,
        gravity
      );

      // Draw parabola comparison if enabled
      if (showParabola) {
        const parabolaPoints = calculateParabola(anchor1, anchor2, 100);
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
        ctx.lineWidth = 2;
        parabolaPoints.forEach((point, idx) => {
          if (idx === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }

      // Draw catenary chain
      ctx.beginPath();
      ctx.strokeStyle = mode === "arch" ? "#8B7355" : "#654321";
      ctx.lineWidth = mode === "arch" ? 6 : 4;
      ctx.lineCap = "round";

      catenaryPoints.forEach((point, idx) => {
        if (idx === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });

      if (mode === "arch") {
        // For arch mode, invert the curve
        ctx.save();
        ctx.translate(0, (anchor1.y + anchor2.y) / 2);
        ctx.scale(1, -1);
        ctx.translate(0, -(anchor1.y + anchor2.y) / 2);
      }

      ctx.stroke();

      if (mode === "arch") {
        ctx.restore();
      }

      // Draw tension vectors if enabled
      if (showTension) {
        for (let j = 0; j < catenaryPoints.length - 1; j += 10) {
          const point = catenaryPoints[j];
          const nextPoint = catenaryPoints[j + 1];
          const tension = calculateTension(point, nextPoint, chainMass, gravity);

          const arrowLength = 30;
          const endX = point.x + Math.cos(tension.angle) * arrowLength;
          const endY = point.y + Math.sin(tension.angle) * arrowLength;

          // Draw arrow
          ctx.beginPath();
          ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
          ctx.lineWidth = 2;
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Arrowhead
          const headLength = 8;
          const headAngle = Math.PI / 6;
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headLength * Math.cos(tension.angle - headAngle),
            endY - headLength * Math.sin(tension.angle - headAngle)
          );
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headLength * Math.cos(tension.angle + headAngle),
            endY - headLength * Math.sin(tension.angle + headAngle)
          );
          ctx.stroke();
        }
      }
    }

    // Draw anchors
    anchors.forEach((anchor) => {
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#000000";
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw equation if enabled
    if (showEquation) {
      ctx.fillStyle = "#000000";
      ctx.font = "16px monospace";
      ctx.fillText("y = a·cosh(x/a) + b", 10, 30);
    }
  }, [
    anchors,
    chainLength,
    gravity,
    chainMass,
    showTension,
    showEquation,
    showParabola,
    mode,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
      className="w-full h-full cursor-crosshair"
      style={{ touchAction: "none" }}
    />
  );
};

export default CatenaryCanvas;
