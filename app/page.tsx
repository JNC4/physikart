"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/shared/ParticleBackground";

const simulations = [
  {
    title: "Epicycle Orbits",
    path: "/epicycles",
    description:
      "Watch celestial mechanics unfold through nested circular motion. Recreate retrograde planetary motion and explore ancient astronomy.",
    icon: "🌍",
    color: "from-blue-500 to-cyan-600",
  },
  {
    title: "Standing Waves",
    path: "/waves",
    description:
      "Pluck virtual strings and visualize harmonics. See resonance in action and explore the physics behind musical instruments.",
    icon: "〰️",
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "Double Pendulum",
    path: "/pendulum",
    description:
      "Witness deterministic chaos unfold in real-time. Experience the butterfly effect as tiny changes create wildly different trajectories.",
    icon: "⚖️",
    color: "from-purple-500 to-pink-600",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            PhysikArt
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 italic">
            the very hairs of your head are all numbered
          </p>
        </motion.div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {simulations.map((sim, index) => (
            <motion.div
              key={sim.path}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={sim.path}>
                <div className="group relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-8 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-400/20 hover:-translate-y-2">
                  {/* Gradient Overlay */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${sim.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="text-5xl mb-4">{sim.icon}</div>
                    <h3 className="text-2xl font-bold mb-3 text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      {sim.title}
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {sim.description}
                    </p>
                    <div className="flex items-center text-cyan-400 font-medium group-hover:translate-x-2 transition-transform">
                      Explore
                      <span className="ml-2">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-20"
        >
          <a
            href="https://github.com/JNC4/physikart"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            View on GitHub
          </a>
        </motion.div>
      </div>
    </div>
  );
}
