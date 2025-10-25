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
  const waveStringRef = useRef<WaveString>(
    new WaveString(200, tension, stringMass, damping, stringLength)
  );
  const [time, setTime] = useState(0);
  const [, forceUpdate] = useState({});
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  // Web Audio API setup
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainsRef = useRef<GainNode[]>([]);

  // Initialize Audio Context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update wave string when parameters change
  useEffect(() => {
    waveStringRef.current = new WaveString(200, tension, stringMass, damping, stringLength);
    setTime(0);
  }, [tension, stringMass, damping, stringLength]);

  // Play sound based on harmonics
  const playSound = (harmonics: number[], baseFreq: number) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;

    // Resume audio context (required by browsers)
    ctx.resume().then(() => {
      // Stop any existing oscillators
      oscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Ignore if already stopped
        }
      });
      oscillatorsRef.current = [];
      gainsRef.current = [];

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.15;
      masterGain.connect(ctx.destination);

      // Create oscillators for the top harmonics
      for (let i = 0; i < Math.min(harmonics.length, 8); i++) {
        const harmonicAmp = harmonics[i];

        // Validate harmonic amplitude is finite and positive
        if (!isFinite(harmonicAmp) || harmonicAmp <= 0.01) continue;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const frequency = baseFreq * (i + 1);
        if (!isFinite(frequency) || frequency <= 0) continue;

        osc.frequency.value = frequency;
        osc.type = 'sine';

        const initialGain = Math.max(0.001, Math.min(1.0, harmonicAmp / 5));
        gain.gain.setValueAtTime(initialGain, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();

        oscillatorsRef.current.push(osc);
        gainsRef.current.push(gain);
      }
    });
  };

  // Handle mouse/touch interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const amplitude = ((e.clientY - rect.top) / rect.height - 0.5) * 200;

    if (mode === "pluck") {
      waveStringRef.current.pluck(x, amplitude);

      // Calculate and play sound immediately (before wave starts moving)
      const fundamentalFreq = waveStringRef.current.getFundamentalFrequency();

      // Only play sound if frequency is valid and audible (20Hz - 2000Hz)
      if (isFinite(fundamentalFreq) && fundamentalFreq >= 20 && fundamentalFreq <= 2000) {
        // Analyze the initial shape right after pluck
        const positions = waveStringRef.current.getPositions();
        const harmonics = analyzeHarmonics(positions, 8);

        // Check if we have any significant harmonics
        const maxHarmonic = Math.max(...harmonics);

        console.log('Fundamental freq:', fundamentalFreq, 'Hz');
        console.log('Harmonics:', harmonics);
        console.log('Max harmonic:', maxHarmonic);

        if (maxHarmonic > 0.01) {
          playSound(harmonics, fundamentalFreq);
        } else {
          console.log('No significant harmonics detected');
        }
      } else {
        console.log('Frequency out of range:', fundamentalFreq, 'Hz');
      }
    }
  };

  // Handle drive mode audio
  useEffect(() => {
    if (mode === "drive" && audioContextRef.current) {
      const ctx = audioContextRef.current;

      // Resume audio context (required by browsers)
      ctx.resume().then(() => {
        // Stop any existing oscillators
        oscillatorsRef.current.forEach(osc => {
          try {
            osc.stop();
          } catch (e) {
            // Ignore if already stopped
          }
        });
        oscillatorsRef.current = [];
        gainsRef.current = [];

        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.1;
        masterGain.connect(ctx.destination);

        // Create a single oscillator for the driving frequency
        const osc = ctx.createOscillator();
        osc.frequency.value = drivingFrequency;
        osc.type = 'sine';
        osc.connect(masterGain);
        osc.start();

        oscillatorsRef.current.push(osc);
        gainsRef.current.push(masterGain);
      });

      return () => {
        oscillatorsRef.current.forEach(osc => {
          try {
            osc.stop();
          } catch (e) {
            // Ignore if already stopped
          }
        });
        oscillatorsRef.current = [];
        gainsRef.current = [];
      };
    } else if (mode === "pluck") {
      // Stop oscillators when switching to pluck mode
      oscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Ignore if already stopped
        }
      });
      oscillatorsRef.current = [];
      gainsRef.current = [];
    }
  }, [mode, drivingFrequency]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.016);
      lastTimeRef.current = now;

      const newTime = time + deltaTime;
      setTime(newTime);

      // Update wave physics with smaller time steps for stability
      const numSteps = 4; // Subdivide for better stability
      const dt = (deltaTime * 3) / numSteps; // Reduced speed

      for (let i = 0; i < numSteps; i++) {
        waveStringRef.current.update(dt);

        // Apply driving force during physics update
        if (mode === "drive") {
          waveStringRef.current.drive(drivingFrequency, newTime, 15);
        }
      }

      forceUpdate({});
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode, drivingFrequency, time]);

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
    const positions = waveStringRef.current.getPositions();
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
  }, [showNodes, showAntinodes, time]);

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
    const positions = waveStringRef.current.getPositions();
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
  }, [showSpectrum, time]);

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
