# PhysikArt

*"the very hairs of your head are all numbered"*

An interactive physics visualization website featuring four beautiful mathematical simulations built with Next.js, TypeScript, and Canvas API.

## 🎨 Live Demo

Visit [physikart.vercel.app](https://physikart.vercel.app) to explore the simulations!

## 🔬 Simulations

### 1. Catenary Chain Simulator
Explore the elegant catenary curve formed by hanging chains. Build arches, suspension bridges, and discover why the catenary differs from a parabola.

**Features:**
- Interactive anchor point placement
- Real-time physics simulation
- Multiple modes: chain, arch, bridge
- Tension vector visualization
- Parabola comparison overlay

### 2. Epicycle Orbit Mechanics
Watch celestial mechanics unfold through nested circular motion. Recreate retrograde planetary motion and create beautiful spirograph patterns.

**Features:**
- Nested circular orbits (up to 4 levels)
- Beautiful traced paths with fading trails
- Presets for astronomical phenomena
- Velocity vector visualization
- Real-time orbit calculations

### 3. Standing Wave Harmonics
Pluck virtual strings and visualize harmonics. See resonance in action and explore the physics behind musical instruments.

**Features:**
- Interactive string plucking
- Frequency-driven resonance mode
- Real-time harmonic analysis (FFT)
- Node and antinode visualization
- Musical instrument presets

### 4. Double Pendulum Chaos
Witness deterministic chaos unfold in real-time. Experience the butterfly effect as tiny changes create wildly different trajectories.

**Features:**
- Accurate physics using RK4 integration
- Multiple simultaneous pendulums (butterfly effect)
- Energy conservation visualization
- Chaotic trajectory tracing
- Real-time chaos demonstration

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Physics:** Custom implementations using Canvas API
- **Deployment:** Vercel

## 🎯 Features

- ✨ Four distinct interactive simulations
- 📱 Fully responsive design with touch support
- 🎨 Dark theme with beautiful gradients
- 📊 Real-time physics calculations
- 🎛️ Interactive controls and presets
- 📚 Educational information panels
- ⚡ 60 FPS canvas animations
- 🎭 Smooth page transitions

## 💻 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/JNC4/physikart.git

# Navigate to the project
cd physikart

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
physikart/
├── app/                      # Next.js app router pages
│   ├── catenary/            # Catenary simulation page
│   ├── epicycles/           # Epicycle simulation page
│   ├── waves/               # Wave simulation page
│   ├── pendulum/            # Pendulum simulation page
│   ├── layout.tsx           # Root layout with header
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── shared/              # Shared UI components
│   ├── catenary/            # Catenary-specific components
│   ├── epicycles/           # Epicycle-specific components
│   ├── waves/               # Wave-specific components
│   └── pendulum/            # Pendulum-specific components
└── lib/                     # Utility functions
```

## 🎓 Educational Value

Each simulation includes:
- **What it is:** Clear explanation of the phenomenon
- **Real-world applications:** Where it appears in nature and technology
- **Historical context:** The science and mathematics behind it
- **Interactive learning:** Hands-on exploration with presets

## 🔧 Physics Implementations

- **Catenary:** Numerical solution of catenary equation `y = a·cosh(x/a)`
- **Epicycles:** Nested circular motion using trigonometric composition
- **Waves:** Mass-spring model with wave equation integration
- **Pendulum:** Runge-Kutta 4th order integration of coupled differential equations

## 📜 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built with:
- Next.js by Vercel
- TypeScript by Microsoft
- Tailwind CSS
- Framer Motion

Created with assistance from Claude Code.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/JNC4/physikart/issues).

## 📧 Contact

Project Link: [https://github.com/JNC4/physikart](https://github.com/JNC4/physikart)

---

*Made with ❤️ and physics*
