"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plate } from "@/components/plate";
import { formatAverage, formatScore, namesDiffer, ratingLabel } from "@/lib/format";
import type { BoardRow } from "@/lib/types";

export function Board({ rows, you }: { rows: BoardRow[]; you: string | null }) {
  const [query, setQuery] = useState("");
  const [todo, setTodo] = useState(false);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (todo && row.yourScore != null) return false;
      if (!needle) return true;
      const official = row.officialName ?? "";
      return row.name.toLowerCase().includes(needle) || official.toLowerCase().includes(needle);
    });
  }, [query, rows, todo]);

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-3xl tracking-tight">Every product</h2>
        <div className="ml-auto flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter"
            aria-label="Filter products"
            className="h-10 w-full rounded-full border border-line bg-card px-3 text-sm sm:w-48"
          />
          {you ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={todo}
                onChange={(event) => setTodo(event.target.checked)}
                className="h-4 w-4 accent-moss"
              />
              Still for {you} to taste
            </label>
          ) : null}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="card rounded-2xl px-4 py-8 text-center text-muted">
          {rows.length === 0 ? "The board is empty. Add a product to start." : "Nothing matches that filter."}
        </p>
      ) : (
        <ol className="card divide-y divide-line overflow-hidden rounded-3xl">
          {visible.map((row) => (
            <li key={row.id}>
              <Link
                href={`/product/${row.id}`}
                className="grid grid-cols-[2rem_3.5rem_minmax(0,1fr)_3.6rem] items-center gap-3 px-3 py-3 hover:bg-white sm:grid-cols-[2.5rem_4rem_minmax(0,1fr)_4.5rem] sm:px-4"
              >
                <span className="text-center font-display text-xl tabular-nums text-muted">
                  {row.rank ?? "–"}
                </span>
                <Plate
                  image={row.image}
                  name={row.name}
                  alt=""
                  size={200}
                  className="h-14 w-14 rounded-xl sm:h-16 sm:w-16"
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{row.name}</span>
                  <span className="mt-0.5 block truncate text-sm text-muted">
                    {row.count ? ratingLabel(row.count) : "No scores yet"}
                    {namesDiffer(row.name, row.officialName) && row.weight ? ` · ${row.weight}` : ""}
                    {row.yourScore != null ? (
                      <span className="text-moss"> · You {formatScore(row.yourScore)}</span>
                    ) : null}
                  </span>
                </span>
                <span className="text-right font-display text-2xl tabular-nums leading-none">
                  {row.average != null ? formatAverage(row.average) : "—"}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
