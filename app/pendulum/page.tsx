"use client";

import { useState } from "react";
import SimulationLayout from "@/components/shared/SimulationLayout";
import PendulumCanvas from "@/components/pendulum/PendulumCanvas";
import { PendulumState, PendulumParams } from "@/components/pendulum/ChaosSimulation";
import {
  Slider,
  Toggle,
  PresetButton,
  Button,
} from "@/components/shared/ControlPanel";

export default function PendulumPage() {
  const [params, setParams] = useState<PendulumParams>({
    L1: 150,
    L2: 150,
    m1: 2,
    m2: 2,
    g: 9.81,
    damping: 0,
  });

  const [initialState, setInitialState] = useState<PendulumState>({
    theta1: Math.PI / 2,
    theta2: Math.PI / 2,
    omega1: 0,
    omega2: 0,
  });

  const [trailLength, setTrailLength] = useState(2000);
  const [showArms, setShowArms] = useState(true);
  const [showTraces, setShowTraces] = useState(true);
  const [showEnergy, setShowEnergy] = useState(false);
  const [numOverlays, setNumOverlays] = useState(1);
  const [randomness, setRandomness] = useState(0.1);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const reset = () => {
    setInitialState({ ...initialState });
  };

  const controls = (
    <div>
      <h3 className="text-sm font-semibold mb-3 text-gray-300">
        Pendulum Parameters
      </h3>
      <Slider
        label="Pendulum 1 Length"
        value={params.L1}
        min={50}
        max={250}
        step={10}
        onChange={(val) => setParams({ ...params, L1: val })}
        unit=" px"
      />
      <Slider
        label="Pendulum 2 Length"
        value={params.L2}
        min={50}
        max={250}
        step={10}
        onChange={(val) => setParams({ ...params, L2: val })}
        unit=" px"
      />
      <Slider
        label="Mass 1"
        value={params.m1}
        min={1}
        max={10}
        step={0.5}
        onChange={(val) => setParams({ ...params, m1: val })}
        unit=" kg"
      />
      <Slider
        label="Mass 2"
        value={params.m2}
        min={1}
        max={10}
        step={0.5}
        onChange={(val) => setParams({ ...params, m2: val })}
        unit=" kg"
      />
      <Slider
        label="Gravity"
        value={params.g}
        min={5}
        max={15}
        step={0.5}
        onChange={(val) => setParams({ ...params, g: val })}
        unit=" m/s²"
      />
      <Slider
        label="Damping"
        value={params.damping}
        min={0}
        max={0.1}
        step={0.01}
        onChange={(val) => setParams({ ...params, damping: val })}
      />

      <div className="my-4 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">
          Initial Conditions
        </h3>
        <Slider
          label="Angle 1"
          value={(initialState.theta1 * 180) / Math.PI}
          min={-180}
          max={180}
          step={5}
          onChange={(val) =>
            setInitialState({ ...initialState, theta1: (val * Math.PI) / 180 })
          }
          unit="°"
        />
        <Slider
          label="Angle 2"
          value={(initialState.theta2 * 180) / Math.PI}
          min={-180}
          max={180}
          step={5}
          onChange={(val) =>
            setInitialState({ ...initialState, theta2: (val * Math.PI) / 180 })
          }
          unit="°"
        />
      </div>

      <div className="my-4 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">
          Chaos Visualization
        </h3>
        <Slider
          label="Number of Overlays"
          value={numOverlays}
          min={1}
          max={20}
          step={1}
          onChange={setNumOverlays}
        />
        {numOverlays > 1 && (
          <Slider
            label="Randomness"
            value={randomness}
            min={0}
            max={5}
            step={0.1}
            onChange={setRandomness}
            unit="°"
          />
        )}
        <Slider
          label="Trail Length"
          value={trailLength}
          min={500}
          max={10000}
          step={500}
          onChange={setTrailLength}
          unit=" frames"
        />
      </div>

      <div className="my-4 border-t border-white/10 pt-4">
        <Toggle
          label="Show Pendulum Arms"
          checked={showArms}
          onChange={setShowArms}
        />
        <Toggle
          label="Show Trace Paths"
          checked={showTraces}
          onChange={setShowTraces}
        />
        <Toggle
          label="Show Energy Graph"
          checked={showEnergy}
          onChange={setShowEnergy}
        />
      </div>

      <div className="my-4 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">
          Simulation Speed
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setSpeedMultiplier(1)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              speedMultiplier === 1
                ? "bg-cyan-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            1x
          </button>
          <button
            onClick={() => setSpeedMultiplier(2)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              speedMultiplier === 2
                ? "bg-cyan-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            2x
          </button>
          <button
            onClick={() => setSpeedMultiplier(4)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              speedMultiplier === 4
                ? "bg-cyan-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            4x
          </button>
          <button
            onClick={() => setSpeedMultiplier(10)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              speedMultiplier === 10
                ? "bg-cyan-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            10x
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 mt-2">
          <button
            onClick={() => setSpeedMultiplier(20)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              speedMultiplier === 20
                ? "bg-cyan-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            20x
          </button>
        </div>
      </div>

      <div className="my-4 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">Presets</h3>
        <PresetButton
          label="Gentle Swing"
          onClick={() => {
            setInitialState({
              theta1: Math.PI / 6,
              theta2: Math.PI / 6,
              omega1: 0,
              omega2: 0,
            });
            setNumOverlays(1);
          }}
        />
        <PresetButton
          label="Chaotic"
          onClick={() => {
            setInitialState({
              theta1: (120 * Math.PI) / 180,
              theta2: (90 * Math.PI) / 180,
              omega1: 0,
              omega2: 0,
            });
            setNumOverlays(1);
          }}
        />
        <PresetButton
          label="Butterfly Effect"
          onClick={() => {
            setInitialState({
              theta1: Math.PI / 2,
              theta2: Math.PI / 2,
              omega1: 0,
              omega2: 0,
            });
            setNumOverlays(10);
            setRandomness(0.1);
          }}
        />
        <PresetButton
          label="Energy Demo"
          onClick={() => {
            setInitialState({
              theta1: Math.PI / 3,
              theta2: Math.PI / 3,
              omega1: 0,
              omega2: 0,
            });
            setParams({ ...params, damping: 0 });
            setShowEnergy(true);
            setNumOverlays(1);
          }}
        />
      </div>

      <div className="mt-4 flex gap-2">
        <Button label="Reset" onClick={reset} variant="secondary" />
      </div>
    </div>
  );

  const info = (
    <div className="text-sm text-gray-300 space-y-3">
      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">
          What is Deterministic Chaos?
        </h3>
        <p>
          The double pendulum follows precise mathematical equations, yet its
          behavior is unpredictable. Tiny differences in starting conditions lead
          to wildly different outcomes - this is deterministic chaos.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">Butterfly Effect</h3>
        <p>
          Try the &quot;Butterfly Effect&quot; preset: multiple pendulums start nearly
          identically but quickly diverge. This sensitivity to initial conditions
          is why weather forecasts fail beyond ~10 days.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">
          Energy Conservation
        </h3>
        <p>
          With zero damping, total energy (kinetic + potential) remains constant
          even as the motion appears chaotic. The graph shows how energy shifts
          between forms.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">Real-World Chaos</h3>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Weather and climate systems</li>
          <li>Solar system long-term dynamics</li>
          <li>Turbulent fluid flow</li>
          <li>Population dynamics</li>
          <li>Stock market fluctuations</li>
          <li>Heart rhythms (arrhythmias)</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">
          Why We Can&apos;t Predict
        </h3>
        <p className="text-xs">
          Even with perfect equations, we can never measure initial conditions
          with infinite precision. Chaos amplifies tiny measurement errors
          exponentially, making long-term prediction impossible despite perfect
          knowledge of the laws.
        </p>
      </div>
    </div>
  );

  return (
    <SimulationLayout
      title="Double Pendulum Chaos"
      controls={controls}
      info={info}
    >
      <PendulumCanvas
        params={params}
        initialState={initialState}
        trailLength={trailLength}
        showArms={showArms}
        showTraces={showTraces}
        showEnergy={showEnergy}
        numOverlays={numOverlays}
        randomness={randomness}
        speedMultiplier={speedMultiplier}
      />
    </SimulationLayout>
  );
}
