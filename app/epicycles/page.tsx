"use client";

import { useState } from "react";
import SimulationLayout from "@/components/shared/SimulationLayout";
import EpicycleCanvas from "@/components/epicycles/EpicycleCanvas";
import { Circle, presets } from "@/components/epicycles/OrbitMath";
import {
  Slider,
  Toggle,
  PresetButton,
} from "@/components/shared/ControlPanel";

export default function EpicyclesPage() {
  const [circles, setCircles] = useState<Circle[]>(presets.simpleCircle());
  const [trailLength, setTrailLength] = useState(1000);
  const [showCircles, setShowCircles] = useState(true);
  const [showCenters, setShowCenters] = useState(true);
  const [showRadii, setShowRadii] = useState(true);
  const [showVelocity, setShowVelocity] = useState(false);

  const controls = (
    <div>
      <Slider
        label="Trail Length"
        value={trailLength}
        min={100}
        max={5000}
        step={100}
        onChange={setTrailLength}
        unit=" frames"
      />

      <div className="my-4 border-t border-white/10 pt-4">
        <Toggle
          label="Show Circle Guides"
          checked={showCircles}
          onChange={setShowCircles}
        />
        <Toggle
          label="Show Center Points"
          checked={showCenters}
          onChange={setShowCenters}
        />
        <Toggle
          label="Show Rotating Radii"
          checked={showRadii}
          onChange={setShowRadii}
        />
        <Toggle
          label="Show Velocity Vector"
          checked={showVelocity}
          onChange={setShowVelocity}
        />
      </div>

      <div className="my-4 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">Presets</h3>
        <PresetButton
          label="Simple Circle"
          onClick={() => setCircles(presets.simpleCircle())}
        />
        <PresetButton
          label="Ellipse"
          onClick={() => setCircles(presets.ellipse())}
        />
        <PresetButton
          label="Retrograde Mars"
          onClick={() => setCircles(presets.retrogradeMars())}
        />
        <PresetButton
          label="Moon System"
          onClick={() => setCircles(presets.moonSystem())}
        />
      </div>
    </div>
  );

  const info = (
    <div className="text-sm text-gray-300 space-y-3">
      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">
          What are Epicycles?
        </h3>
        <p>
          Epicycles are circles moving on circles. Ancient astronomers used them
          to explain planetary motion, with planets moving on small circles
          (epicycles) whose centers moved on larger circles (deferents).
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">
          Retrograde Motion
        </h3>
        <p>
          When viewed from Earth, planets sometimes appear to move backward
          against the stars. Ancient epicycle models explained this beautifully
          - though we now know it&apos;s due to Earth overtaking slower outer
          planets.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">
          Modern Applications
        </h3>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>GPS satellite orbits</li>
          <li>Lagrange point dynamics</li>
          <li>Fourier series (frequency decomposition)</li>
          <li>Spirograph art</li>
          <li>Gear mechanism design</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-cyan-400 mb-2">
          Historical Note
        </h3>
        <p className="text-xs">
          Ptolemy&apos;s geocentric model used epicycles for centuries until
          Copernicus and Kepler showed that planets follow elliptical orbits
          around the Sun. Yet the mathematics of epicycles remains useful in
          signal processing and engineering!
        </p>
      </div>
    </div>
  );

  return (
    <SimulationLayout
      title="Epicycle Orbit Mechanics"
      controls={controls}
      info={info}
    >
      <EpicycleCanvas
        circles={circles}
        trailLength={trailLength}
        showCircles={showCircles}
        showCenters={showCenters}
        showRadii={showRadii}
        showVelocity={showVelocity}
      />
    </SimulationLayout>
  );
}
