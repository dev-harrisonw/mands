"use client";

import { useRef, useState, useTransition } from "react";
import { rate } from "@/app/actions";
import { formatScore } from "@/lib/format";

const marks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function ScorePad({
  productId,
  initial,
  canScore,
}: {
  productId: string;
  initial: number | null;
  canScore: boolean;
}) {
  const [score, setScore] = useState<number | null>(initial);
  const [status, setStatus] = useState("");
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function commit(next: number | null) {
    if (timer.current) clearTimeout(timer.current);
    setScore(next);
    setStatus("Saving…");
    startTransition(async () => {
      const result = await rate(productId, next);
      if (!result.ok) {
        setStatus(result.error);
        return;
      }
      setStatus(
        next == null ? `Cleared · ${result.name}` : `${result.name} added ${formatScore(next)}`,
      );
      window.setTimeout(() => setStatus(""), 6000);
    });
  }

  function slide(next: number) {
    setScore(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(next), 250);
  }

  if (!canScore) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-card px-5 py-6">
        <p className="font-display text-2xl tracking-tight">Score it out of 10</p>
        <p className="mt-2 text-sm text-muted">Pick your name at the top. Then this pad is yours.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-card px-5 py-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Your score</p>
      <p className="mt-2 font-display text-6xl tabular-nums leading-none">
        {score == null ? "—" : formatScore(score)}
      </p>
      {score == null ? (
        <p className="mt-2 text-sm text-muted">Tap a number. Halves come after.</p>
      ) : (
        <div className="mt-4">
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={score}
            aria-label="Fine tune your score"
            onChange={(event) => slide(Number(event.target.value))}
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => commit(Math.max(0, Math.round((score - 0.5) * 2) / 2))}
              className="h-11 flex-1 rounded-full border border-line text-sm disabled:opacity-50"
            >
              − 0.5
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => commit(Math.min(10, Math.round((score + 0.5) * 2) / 2))}
              className="h-11 flex-1 rounded-full border border-line text-sm disabled:opacity-50"
            >
              + 0.5
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => commit(null)}
              className="h-11 rounded-full px-3 text-sm text-muted disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>
      )}
      <div className="mt-4 grid grid-cols-6 gap-2">
        {marks.map((mark) => {
          const selected = score != null && Math.abs(score - mark) < 0.01;
          return (
            <button
              key={mark}
              type="button"
              disabled={pending}
              onClick={() => commit(mark)}
              className={`h-11 rounded-xl text-sm font-semibold tabular-nums disabled:opacity-50 ${
                selected ? "bg-tomato text-white" : "bg-blush hover:bg-white"
              }`}
            >
              {mark}
            </button>
          );
        })}
      </div>
      <p className="mt-3 min-h-5 text-sm text-muted" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
