"use client";

import { useEffect, useRef, useState } from "react";
import {
  WaveString,
  analyzeHarmonics,
  getNodes,
  getAntinodes,
} from "./WavePhysics";

interface WaveCanvasProps {
  tension: number;
  stringLength: number;
  stringMass: number;
  damping: number;
  drivingFrequency: number;
  showNodes: boolean;
  showAntinodes: boolean;
  showSpectrum: boolean;
  mode: "pluck" | "drive";
}

const WaveCanvas: React.FC<WaveCanvasProps> = ({
  tension,
  stringLength,
  stringMass,
  damping,
  drivingFrequency,
  showNodes,
  showAntinodes,
  showSpectrum,
  mode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null);
  const [waveString, setWaveString] = useState<WaveString>(
    () => new WaveString(200, tension, stringMass, damping, stringLength)
  );
  const [time, setTime] = useState(0);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  // Update wave string when parameters change
  useEffect(() => {
    setWaveString(
      new WaveString(200, tension, stringMass, damping, stringLength)
    );
  }, [tension, stringMass, damping, stringLength]);

  // Handle mouse/touch interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const amplitude = ((e.clientY - rect.top) / rect.height - 0.5) * 200;

    if (mode === "pluck") {
      waveString.pluck(x, amplitude);
    }
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.016);
      lastTimeRef.current = now;

      setTime((t) => t + deltaTime);

      // Update wave
      if (mode === "drive") {
        waveString.drive(drivingFrequency, time, 2);
      }

      waveString.update(deltaTime * 10); // Speed up simulation

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [waveString, time, mode, drivingFrequency]);

  // Draw main canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    // Clear with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#0a0a14");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Get wave positions
    const positions = waveString.getPositions();
    const numPoints = positions.length;

    // Draw string
    ctx.beginPath();
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#FFD700";

    positions.forEach((y, i) => {
      const x = (i / (numPoints - 1)) * width;
      const screenY = centerY + y;

      if (i === 0) {
        ctx.moveTo(x, screenY);
      } else {
        ctx.lineTo(x, screenY);
      }
    });

    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw nodes
    if (showNodes) {
      const harmonicNodes = getNodes(3, numPoints);
      harmonicNodes.forEach((nodeIdx) => {
        const x = (nodeIdx / (numPoints - 1)) * width;
        ctx.beginPath();
        ctx.arc(x, centerY, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#FF0000";
        ctx.fill();
      });
    }

    // Draw antinodes
    if (showAntinodes) {
      const harmonicAntinodes = getAntinodes(3, numPoints);
      harmonicAntinodes.forEach((antinodeIdx) => {
        const x = (antinodeIdx / (numPoints - 1)) * width;
        const y = positions[antinodeIdx];
        ctx.beginPath();
        ctx.arc(x, centerY + y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#00BFFF";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      });
    }

    // Draw endpoints
    ctx.beginPath();
    ctx.arc(0, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
  }, [waveString, showNodes, showAntinodes]);

  // Draw spectrum
  useEffect(() => {
    if (!showSpectrum) return;

    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, width, height);

    // Analyze harmonics
    const positions = waveString.getPositions();
    const harmonics = analyzeHarmonics(positions, 8);
    const maxAmplitude = Math.max(...harmonics, 0.1);

    // Draw bars
    const barWidth = width / harmonics.length;

    harmonics.forEach((amplitude, i) => {
      const barHeight = (amplitude / maxAmplitude) * height * 0.8;
      const x = i * barWidth;
      const y = height - barHeight;

      const hue = (i / harmonics.length) * 120 + 180;
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

      // Label
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${i + 1}`, x + barWidth / 2, height - 5);
    });
  }, [waveString, showSpectrum]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        onPointerDown={handlePointerDown}
        className="w-full cursor-pointer"
        style={{ touchAction: "none" }}
      />
      {showSpectrum && (
        <canvas
          ref={spectrumCanvasRef}
          width={800}
          height={150}
          className="w-full mt-2"
        />
      )}
    </div>
  );
};

export default WaveCanvas;
