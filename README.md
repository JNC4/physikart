# PhysikArt

> *the very hairs of your head are all numbered.*
> Matthew 10:30

**Fine-tuning, made visible.** An exhibition of mathematical phenomena whose
beauty lives on a knife-edge. Each plate is a real system, simulated honestly,
with its one true value marked in red. You are handed the dial. Turn it off the
mark and watch what becomes of the order that stood there a moment before.

It is one argued scroll. An overture states the thesis once, a sequence of
plates witnesses to it, and a coda lets the plates make the case. The claim is
never argued in words. The systems carry it themselves, and they genuinely fall
apart when you push them off their true values.

## The plates

1. **The band of life.** Gray-Scott reaction-diffusion on the GPU. The whole
   variety of natural pattern lives in a thin curved sliver of the feed/kill
   plane. Step outside that sliver and the field decays to a uniform, sterile
   blank.
2. **Order at a number.** Chladni figures of a square plate. Sand collects into
   a symmetric figure only at the plate's exact resonant frequencies, a ladder
   of single numbers standing in a continuum of silence.
3. **Connected, or dust.** Julia sets of *z² + c*. The set holds as a single
   connected body while *c* lies in the Mandelbrot set, and shatters into
   infinite disconnected dust the instant *c* steps over the boundary. On the
   real axis that crossing falls at exactly one quarter. *Scroll to zoom, drag
   to pan. The detail never ends.*
4. **The constant beneath chaos.** The logistic map. Period-doublings crowd
   toward r∞ = 3.5699, and the ratio of their spacings approaches Feigenbaum's δ
   = 4.669, the same constant that governs dripping taps and stirred reactions
   that share no physics with it.
5. **The carbon resonance.** The triple-alpha process and the Hoyle state.
   Stars assemble carbon only because a level of the carbon nucleus sits almost
   exactly in the thermal window of helium burning. Shift the strong force a
   percent and that level slides off, the reaction rate falls by orders of
   magnitude through the ordinary Boltzmann factor, and the carbon is never
   made. The cold-side collapse is the real Gamow physics, computed live; the
   carbon-to-oxygen edge of the window is a labelled reduced model of the
   published result, not a first-principles burn.
6. **The angle that never repeats.** Phyllotaxis. A growing tip lays down seeds
   one fixed turn apart. Every simple fraction of a turn heaps them onto that
   many radial spokes, and those angles lie scattered all across the dial. The
   golden angle, 137.508 degrees, set by the most irrational number, is the one
   value that slips past all of them and fills the head evenly with no seams.
   Nothing is drawn but dots placed one turn apart.

## Architecture

A deliberate rebuild from the ground up.

- **Engine core** (`lib/sim/`). One fixed-timestep loop per plate, simulation
  state held in refs rather than React state, DPR-aware canvases, and automatic
  pause when a plate scrolls offscreen or the tab is hidden.
- **WebGL** (`lib/sim/gl.ts`). A small owned WebGL2 helper: shaders, programs,
  half-float ping-pong fields, no dependency.
- **The knife-edge grammar** (`components/blueprint/`). `Dial` (true value
  marked in red, alive band shaded), `Readout`, and the `Witness` shell every
  plate wears.
- **Design.** A draughtsman's-sheet aesthetic: warm graph-ruled paper, dark
  instrument-plates, three deliberate typefaces (Spectral for the argument,
  Space Grotesk for labels, IBM Plex Mono for every number), one red accent.

Built with Next.js, TypeScript, and Tailwind. The simulation maths lives in
`lib/`; each plate is a sim module plus a witness component.

## Running

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Requires a browser with WebGL2 for the field plates. The argument and the
Canvas-2D plate degrade gracefully without it.
