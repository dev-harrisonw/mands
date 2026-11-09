import Link from "next/link";
import { AddProduct } from "@/components/add-product";
import { Board } from "@/components/board";
import { Plate } from "@/components/plate";
import { formatAverage, formatScore, namesDiffer, ratingLabel } from "@/lib/format";
import { boardRows } from "@/lib/rank";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const { state, taster } = await getSession();
  const rows = boardRows(state, taster?.id ?? null);
  const leader = rows.find((row) => row.rank === 1) ?? null;
  const scored = state.ratings.length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tight">The leaderboard</h1>
          <p className="mt-2 max-w-xl text-muted">
            Average score out of 10. A tie stays with whichever product landed on the board first.
            {scored ? ` ${scored} scores so far.` : ""}
          </p>
        </div>
        <AddProduct />
      </div>

      {leader ? (
        <Link
          href={`/product/${leader.id}`}
          className="card mt-8 grid gap-5 rounded-3xl p-4 hover:bg-white sm:grid-cols-[13rem_1fr] sm:p-6"
        >
          <Plate
            image={leader.image}
            name={leader.name}
            alt=""
            eager
            className="aspect-square w-full rounded-2xl"
          />
          <div className="flex flex-col justify-center">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-tomato">Top of the board</p>
            <h2 className="mt-2 font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl">
              {leader.name}
            </h2>
            {namesDiffer(leader.name, leader.officialName) ? (
              <p className="mt-2 text-sm text-muted">On the shop: {leader.officialName}</p>
            ) : null}
            <p className="mt-4 font-display text-6xl tabular-nums leading-none">
              {formatAverage(leader.average ?? 0)}
            </p>
            <p className="mt-2 text-muted">
              {ratingLabel(leader.count)} · out of 10
              {leader.weight ? ` · ${leader.weight}` : ""}
            </p>
            {taster && leader.yourScore != null ? (
              <p className="mt-3 text-moss">You scored {formatScore(leader.yourScore)}</p>
            ) : null}
            {taster && leader.yourScore == null ? (
              <p className="mt-3 text-muted">You haven&apos;t scored this yet.</p>
            ) : null}
          </div>
        </Link>
      ) : null}

      <Board rows={rows} you={taster?.name ?? null} />
    </div>
  );
}
