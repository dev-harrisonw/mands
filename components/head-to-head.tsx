"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plate } from "@/components/plate";
import { formatScore } from "@/lib/format";
import type { Person, Product, Rating } from "@/lib/types";

export function HeadToHead({
  people,
  products,
  ratings,
  initialA,
  initialB,
}: {
  people: Person[];
  products: Product[];
  ratings: Rating[];
  initialA: string;
  initialB: string;
}) {
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);

  const result = useMemo(() => {
    const aName = people.find((person) => person.id === a)?.name ?? "A";
    const bName = people.find((person) => person.id === b)?.name ?? "B";
    const aScores = new Map(
      ratings.filter((rating) => rating.personId === a).map((rating) => [rating.productId, rating.score]),
    );
    const bScores = new Map(
      ratings.filter((rating) => rating.personId === b).map((rating) => [rating.productId, rating.score]),
    );
    const shared = products
      .flatMap((product) => {
        const left = aScores.get(product.id);
        const right = bScores.get(product.id);
        if (left == null || right == null) return [];
        return [{ product, left, right, gap: left - right }];
      })
      .sort(
        (left, right) =>
          Math.abs(right.gap) - Math.abs(left.gap) || left.product.name.localeCompare(right.product.name),
      );
    const aWins = shared.filter((row) => row.gap > 0).length;
    const bWins = shared.filter((row) => row.gap < 0).length;
    const draws = shared.length - aWins - bWins;
    return { aName, bName, shared, aWins, bWins, draws };
  }, [a, b, people, products, ratings]);

  const same = a === b;

  return (
    <section>
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <PersonSelect label="First taster" people={people} value={a} onChange={setA} />
        <p className="text-center font-display text-2xl text-muted">vs</p>
        <PersonSelect label="Second taster" people={people} value={b} onChange={setB} />
      </div>

      {same ? (
        <p className="card mt-6 rounded-3xl px-5 py-8 text-center text-muted">
          Pick two different people.
        </p>
      ) : (
        <>
          <div className="card mt-6 grid grid-cols-3 rounded-3xl px-3 py-6 text-center">
            <div>
              <p className="font-display text-5xl tabular-nums">{result.aWins}</p>
              <p className="mt-1 text-sm">{result.aName}</p>
            </div>
            <div>
              <p className="font-display text-5xl tabular-nums text-muted">{result.draws}</p>
              <p className="mt-1 text-sm text-muted">draws</p>
            </div>
            <div>
              <p className="font-display text-5xl tabular-nums">{result.bWins}</p>
              <p className="mt-1 text-sm">{result.bName}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">
            {result.shared.length === 0
              ? "They haven't scored the same product yet."
              : result.aWins === result.bWins
                ? `Level on ${result.shared.length} shared ${result.shared.length === 1 ? "product" : "products"}.`
                : result.aWins > result.bWins
                  ? `${result.aName} is ahead ${result.aWins}–${result.bWins} over ${result.shared.length} shared.`
                  : `${result.bName} is ahead ${result.bWins}–${result.aWins} over ${result.shared.length} shared.`}
          </p>

          <ul className="mt-4 space-y-2">
            {result.shared.map((row) => (
              <li key={row.product.id}>
                <Link
                  href={`/product/${row.product.id}`}
                  className="card grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-3 py-3 hover:bg-white"
                >
                  <Plate
                    image={row.product.image}
                    name={row.product.name}
                    alt=""
                    size={160}
                    className="h-14 w-14 rounded-xl"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{row.product.name}</span>
                    <span className="mt-1 block text-sm text-muted">
                      <span className={row.gap > 0 ? "text-moss" : undefined}>
                        {result.aName} {formatScore(row.left)}
                      </span>
                      {" · "}
                      <span className={row.gap < 0 ? "text-moss" : undefined}>
                        {result.bName} {formatScore(row.right)}
                      </span>
                    </span>
                  </span>
                  <span className="font-display text-xl tabular-nums">
                    {row.gap === 0 ? "–" : row.gap > 0 ? `+${formatScore(row.gap)}` : formatScore(row.gap)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function PersonSelect({
  label,
  people,
  value,
  onChange,
}: {
  label: string;
  people: Person[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 w-full rounded-2xl border border-line bg-card px-3 font-display text-2xl"
      >
        {people.map((person) => (
          <option key={person.id} value={person.id}>
            {person.name}
          </option>
        ))}
      </select>
    </label>
  );
}
