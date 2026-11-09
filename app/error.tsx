"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <h1 className="font-display text-5xl tracking-tight">The board hit a snag</h1>
      <p className="mt-3 text-muted">{error.message || "Something went wrong loading the scores."}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 h-11 rounded-full bg-tomato px-4 text-sm font-semibold text-white hover:bg-ink"
      >
        Try again
      </button>
    </div>
  );
}
