"use client";

import { useState } from "react";
import SimulationLayout from "@/components/shared/SimulationLayout";
import WaveCanvas from "@/components/waves/WaveCanvas";
import {
  Slider,
  Toggle,
  PresetButton,
} from "@/components/shared/ControlPanel";

type Mode = "pluck" | "drive";

export default function WavesPage() {
  const [tension, setTension] = useState(500);
  const [stringLength, setStringLength] = useState(1.0);
  const [stringMass, setStringMass] = useState(0.01);
  const [damping, setDamping] = useState(0.1);
  const [drivingFrequency, setDrivingFrequency] = useState(100);
  const [showNodes, setShowNodes] = useState(false);
  const [showAntinodes, setShowAntinodes] = useState(false);
  const [showSpectrum, setShowSpectrum] = useState(true);
  const [mode, setMode] = useState<Mode>("pluck");

  const controls = (
    <div>
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("pluck")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
              mode === "pluck"
                ? "bg-cyan-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Pluck
          </button>
          <button
            onClick={() => setMode("drive")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
              mode === "drive"
                ? "bg-cyan-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Drive
          </button>
        </div>
      </div>

      <Slider
        label="String Tension"
        value={tension}
        min={10}
        max={1000}
        step={10}
        onChange={setTension}
        unit=" N"
      />
      <Slider
        label="String Length"
        value={stringLength}
        min={0.3}
        max={2.0}
        step={0.1}
        onChange={setStringLength}
        unit=" m"
      />
      <Slider
        label="String Mass"
        value={stringMass}
        min={0.001}
        max={0.1}
        step={0.001}
        onChange={setStringMass}
        unit=" kg"
      />
      <Slider
        label="Damping"
        value={damping}
        min={0}
        max={0.5}
        step={0.01}
        onChange={setDamping}
      />

      {mode === "drive" && (
        <Slider
          label="Driving Frequency"
          value={drivingFrequency}
          min={20}
          max={500}
          step={5}
          onChange={setDrivingFrequency}
          unit=" Hz"
        />
      )}

      <div className="my-4 border-t border-white/10 pt-4">
        <Toggle
          label="Show Nodes"
          checked={showNodes}
          onChange={setShowNodes}
        />
        <Toggle
          label="Show Antinodes"
          checked={showAntinodes}
          onChange={setShowAntinodes}
        />
        <Toggle
          label="Show Frequency Spectrum"
          checked={showSpectrum}
          onChange={setShowSpectrum}
        />
      </div>

      <div className="my-4 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">Presets</h3>
        <PresetButton
          label="Guitar String (A440)"
          onClick={() => {
            setMode("pluck");
            setTension(600);
            setStringLength(0.65);
            setStringMass(0.005);
            setDamping(0.05);
          }}
        />
        <PresetButton
          label="Piano Wire"
          onClick={() => {
            setMode("pluck");
            setTension(800);
            setStringLength(1.0);
            setStringMass(0.02);
            setDamping(0.02);
          }}
        />
        <PresetButton
          label="Violin Bow"
          onClick={() => {
            setMode("drive");
            setTension(400);
            setStringLength(0.6);
            setStringMass(0.003);
            setDamping(0.08);
            setDrivingFrequency(196);
          }}
        />
        <PresetButton
          label="Resonance Demo"
          onClick={() => {
            setMode("drive");
            setTension(500);
            setStringLength(1.0);
            setStringMass(0.01);
            setDamping(0.05);
            setDrivingFrequency(112);
          }}
        />
      </div>

      <div className="mt-4 p-3 bg-cyan-900/20 rounded-lg text-xs text-gray-300">
        <p>
          <strong>Tip:</strong> In pluck mode, click anywhere on the string to
          pluck it. In drive mode, the string is continuously driven at a
          specific frequency.
        </p>
      </div>
    </div>
  );

  const info = (
    <div className="text-sm text-gray-300 space-y-3">
      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">
          What are Standing Waves?
        </h3>
        <p>
          Standing waves occur when waves traveling in opposite directions
          interfere. On a string fixed at both ends, only specific wavelengths
          (harmonics) can exist.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">
          Harmonics & Overtones
        </h3>
        <p>
          The fundamental frequency is the lowest, and harmonics are integer
          multiples (2f, 3f, 4f...). Musical instruments create unique timbres
          by exciting different combinations of harmonics.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">Nodes & Antinodes</h3>
        <p>
          <strong>Nodes</strong> are points of zero motion (always fixed).{" "}
          <strong>Antinodes</strong> are points of maximum oscillation. The
          number of nodes determines the harmonic number.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">Resonance</h3>
        <p className="text-xs">
          When driven at a natural frequency, the wave amplitude grows
          dramatically. This is why bridges can collapse from rhythmic marching
          (Tacoma Narrows, 1940) and why wine glasses shatter at the right
          pitch!
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">Applications</h3>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Musical instruments (guitar, piano, violin)</li>
          <li>MRI machines</li>
          <li>Earthquake engineering</li>
          <li>Acoustic design</li>
          <li>Laser cavities</li>
        </ul>
      </div>
    </div>
  );

  return (
    <SimulationLayout title="Standing Wave Harmonics" controls={controls} info={info}>
      <WaveCanvas
        tension={tension}
        stringLength={stringLength}
        stringMass={stringMass}
        damping={damping}
        drivingFrequency={drivingFrequency}
        showNodes={showNodes}
        showAntinodes={showAntinodes}
        showSpectrum={showSpectrum}
        mode={mode}
      />
    </SimulationLayout>
  );
}
