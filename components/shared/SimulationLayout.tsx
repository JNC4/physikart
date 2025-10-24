import React from "react";

interface SimulationLayoutProps {
  title: string;
  children: React.ReactNode;
  controls: React.ReactNode;
  info: React.ReactNode;
}

const SimulationLayout: React.FC<SimulationLayoutProps> = ({
  title,
  children,
  controls,
  info,
}) => {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-cyan-400">
        {title}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm overflow-hidden">
            {children}
          </div>
        </div>

        {/* Controls & Info Panel */}
        <div className="space-y-6">
          {/* Controls */}
          <div className="rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">
              Controls
            </h2>
            {controls}
          </div>

          {/* Info Panel */}
          <div className="rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">
              Information
            </h2>
            {info}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationLayout;
