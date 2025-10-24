import React from "react";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = "",
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm text-cyan-400">
          {value.toFixed(step < 1 ? 2 : 0)}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
      />
    </div>
  );
};

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-cyan-500" : "bg-gray-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
}) => {
  const baseClasses =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200";
  const variantClasses =
    variant === "primary"
      ? "bg-cyan-500 hover:bg-cyan-600 text-white"
      : "bg-gray-700 hover:bg-gray-600 text-gray-200";

  return (
    <button className={`${baseClasses} ${variantClasses}`} onClick={onClick}>
      {label}
    </button>
  );
};

interface PresetButtonProps {
  label: string;
  onClick: () => void;
}

export const PresetButton: React.FC<PresetButtonProps> = ({
  label,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-2 mb-2 text-sm rounded-lg bg-purple-900/30 hover:bg-purple-800/50 border border-purple-500/30 text-purple-200 transition-all"
    >
      {label}
    </button>
  );
};
