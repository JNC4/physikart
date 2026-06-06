/** The close: the accumulated argument, then the epigraph, on the bare sheet. */
export default function Coda() {
  return (
    <footer className="mx-auto flex min-h-screen w-full max-w-sheet flex-col justify-center px-5 py-32 text-center">
      <div className="prose-sheet mx-auto space-y-5 text-left">
        <p>
          Nothing connects these plates. A reaction of dyes knows nothing of a
          vibrating plate. Neither has heard of the boundary of a set of complex
          numbers, or the resonance inside a star, or the angle at which a seed
          leaves its neighbour. Yet under the dial each turned on a single exact
          number. For some it was a narrow band you had to stay inside. For one
          it was a boundary of no width at all. For another it was a constant
          that surfaced again in machines that shared no physics. The kind of
          number changed from plate to plate. That there was always a number,
          and that you could read it, did not.
        </p>
        <p>
          Whether you call that coincidence, or selection, or care, the
          arithmetic is not in question. The precision is simply there, in
          everything, down to the smallest place.
        </p>
      </div>

      <blockquote className="mx-auto mt-20 max-w-[24ch]">
        <p className="prose-sheet text-3xl italic leading-snug md:text-4xl">
          the very hairs of your head are all numbered
        </p>
        <cite className="caption mt-6 block normal-case not-italic tracking-[0.2em]">
          Matthew 10 : 30
        </cite>
      </blockquote>

      <div className="caption mt-24 flex items-center justify-center gap-3 text-ink-faint">
        <span className="h-px w-10 bg-[var(--hair)]" />
        <a
          href="https://github.com/JNC4/physikart"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-60"
        >
          source on GitHub
        </a>
        <span className="h-px w-10 bg-[var(--hair)]" />
      </div>
    </footer>
  );
}
