"use client";

import { useState } from "react";
import SimulationLayout from "@/components/shared/SimulationLayout";
import CatenaryCanvas from "@/components/catenary/CatenaryCanvas";
import {
  Slider,
  Toggle,
  PresetButton,
} from "@/components/shared/ControlPanel";

type Mode = "chain" | "arch" | "bridge";

export default function CatenaryPage() {
  const [chainLength, setChainLength] = useState(300);
  const [gravity, setGravity] = useState(1.0);
  const [chainMass, setChainMass] = useState(2.0);
  const [showTension, setShowTension] = useState(false);
  const [showEquation, setShowEquation] = useState(false);
  const [showParabola, setShowParabola] = useState(false);
  const [mode, setMode] = useState<Mode>("chain");

  const controls = (
    <div>
      <Slider
        label="Chain Length"
        value={chainLength}
        min={50}
        max={500}
        step={10}
        onChange={setChainLength}
        unit=" units"
      />
      <Slider
        label="Gravity"
        value={gravity}
        min={0.5}
        max={2.0}
        step={0.1}
        onChange={setGravity}
        unit="g"
      />
      <Slider
        label="Chain Mass"
        value={chainMass}
        min={0.5}
        max={5.0}
        step={0.5}
        onChange={setChainMass}
        unit=" kg"
      />

      <div className="my-4 border-t border-white/10 pt-4">
        <Toggle
          label="Show Tension Vectors"
          checked={showTension}
          onChange={setShowTension}
        />
        <Toggle
          label="Show Equation"
          checked={showEquation}
          onChange={setShowEquation}
        />
        <Toggle
          label="Compare with Parabola"
          checked={showParabola}
          onChange={setShowParabola}
        />
      </div>

      <div className="my-4 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">Presets</h3>
        <PresetButton
          label="Simple Chain"
          onClick={() => {
            setMode("chain");
            setChainLength(300);
            setGravity(1.0);
            setChainMass(2.0);
          }}
        />
        <PresetButton
          label="Stone Arch"
          onClick={() => {
            setMode("arch");
            setChainLength(400);
            setGravity(1.5);
            setChainMass(4.0);
          }}
        />
        <PresetButton
          label="Suspension Bridge"
          onClick={() => {
            setMode("bridge");
            setChainLength(450);
            setGravity(1.0);
            setChainMass(3.0);
          }}
        />
        <PresetButton
          label="Power Lines"
          onClick={() => {
            setMode("chain");
            setChainLength(350);
            setGravity(0.8);
            setChainMass(1.5);
          }}
        />
      </div>

      <div className="mt-4 p-3 bg-cyan-900/20 rounded-lg text-xs text-gray-300">
        <p>
          <strong>Tip:</strong> Click to place anchors, drag to move them,
          right-click to remove.
        </p>
      </div>
    </div>
  );

  const info = (
    <div className="text-sm text-gray-300 space-y-3">
      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">What is a Catenary?</h3>
        <p>
          A catenary is the curve formed by a hanging flexible chain or cable
          when supported at its ends and acted upon by gravity.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">
          Catenary vs Parabola
        </h3>
        <p>
          While a catenary looks similar to a parabola, they are mathematically
          different. A catenary follows y = a·cosh(x/a), while a parabola is y
          = x². Enable the comparison to see the difference!
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">Inverted = Arch</h3>
        <p>
          When inverted, a catenary becomes the ideal shape for an arch,
          distributing weight purely through compression. This is why the
          Gateway Arch in St. Louis uses an inverted catenary design.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">Real Applications</h3>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Suspension bridges (cables)</li>
          <li>Power transmission lines</li>
          <li>Gateway Arch, St. Louis</li>
          <li>Tent and fabric structures</li>
          <li>Architectural design</li>
        </ul>
      </div>
    </div>
  );

  return (
    <SimulationLayout
      title="Catenary Chain Simulator"
      controls={controls}
      info={info}
    >
      <CatenaryCanvas
        chainLength={chainLength}
        gravity={gravity}
        chainMass={chainMass}
        showTension={showTension}
        showEquation={showEquation}
        showParabola={showParabola}
        mode={mode}
      />
    </SimulationLayout>
  );
}
