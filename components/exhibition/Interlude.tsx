import type { ReactNode } from "react";

/** A single connective line between plates, carrying the argument forward. */
export default function Interlude({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-sheet flex-col items-center px-5 py-12 text-center">
      <span className="mb-6 h-10 w-px bg-[var(--hair)]" aria-hidden />
      <p className="prose-sheet max-w-[30rem] text-lg italic text-ink-soft">
        {children}
      </p>
    </div>
  );
}
