import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plate } from "@/components/plate";
import { RemoveProduct } from "@/components/remove-product";
import { ScorePad } from "@/components/score-pad";
import { formatAverage, formatScore, formatWhen, listNames, namesDiffer, ratingLabel, shopUrl } from "@/lib/format";
import { boardRows, productScores } from "@/lib/rank";
import { getSession } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { state } = await getSession();
  const product = state.products.find((item) => item.id === id);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { state, taster } = await getSession();
  const product = state.products.find((item) => item.id === id);
  if (!product) notFound();

  const row = boardRows(state, taster?.id ?? null).find((item) => item.id === id);
  if (!row) notFound();

  const scores = productScores(state, id, taster?.id ?? null);
  const missing = state.people
    .filter((person) => !scores.some((score) => score.personId === person.id))
    .map((person) => person.name);
  const yours = scores.find((score) => score.you)?.score ?? null;
  const others = scores.filter((score) => !score.you);
  const othersAverage = others.length
    ? others.reduce((sum, score) => sum + score.score, 0) / others.length
    : null;
  const shop = shopUrl(product.path);
  const addedBy = state.people.find((person) => person.id === product.addedBy)?.name ?? null;

  let comparison: string | null = null;
  if (yours != null && othersAverage == null) {
    comparison = "You're the first score on this.";
  } else if (yours != null && othersAverage != null) {
    const gap = yours - othersAverage;
    if (Math.abs(gap) < 0.05) {
      comparison = `You're level with everyone else (${formatAverage(othersAverage)}).`;
    } else if (gap > 0) {
      comparison = `You're ${formatAverage(gap)} above everyone else (${formatAverage(othersAverage)}).`;
    } else {
      comparison = `You're ${formatAverage(Math.abs(gap))} below everyone else (${formatAverage(othersAverage)}).`;
    }
  }

  return (
    <div>
      <Link href="/" className="text-sm text-muted hover:text-ink">
        All products
      </Link>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-tomato">
        {row.rank ? `Rank ${row.rank}` : "Waiting for a score"}
      </p>
      <h1 className="mt-2 max-w-3xl font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl">
        {product.name}
      </h1>
      <p className="mt-3 text-sm text-muted">
        {[
          product.weight,
          namesDiffer(product.name, product.officialName) ? `On the shop: ${product.officialName}` : null,
          addedBy ? `Added to the board by ${addedBy}` : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,16rem)_minmax(18rem,1fr)]">
        <div>
          <Plate
            image={product.image}
            name={product.name}
            alt={product.name}
            eager
            className="aspect-square w-full rounded-3xl"
          />
          <p className="mt-4 font-display text-6xl tabular-nums leading-none">
            {row.average == null ? "—" : formatAverage(row.average)}
          </p>
          <p className="mt-2 text-muted">
            {row.count ? `${ratingLabel(row.count)} · average out of 10` : "No scores yet"}
          </p>
          {comparison ? <p className="mt-3 text-sm">{comparison}</p> : null}
          {shop ? (
            <a
              href={shop}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm underline underline-offset-2"
            >
              View on M&S
            </a>
          ) : null}
        </div>
        <ScorePad productId={product.id} initial={yours} canScore={taster != null} />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-3xl tracking-tight">On this product</h2>
        {scores.length === 0 ? (
          <p className="mt-3 text-muted">Nobody has scored it yet.</p>
        ) : (
          <ol className="card mt-4 divide-y divide-line overflow-hidden rounded-3xl">
            {scores.map((score, index) => (
              <li
                key={score.personId}
                className={`grid grid-cols-[2rem_minmax(0,8.5rem)_minmax(0,1fr)_3rem] items-center gap-3 px-4 py-3 ${
                  score.you ? "bg-blush" : ""
                }`}
              >
                <span className="tabular-nums text-muted">{index + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {score.name}
                    {score.you ? <span className="ml-2 text-xs font-medium text-tomato">you</span> : null}
                  </span>
                  {score.addedAt ? (
                    <span className="block text-xs text-muted">added {formatWhen(score.addedAt)}</span>
                  ) : null}
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-blush" aria-hidden>
                  <span
                    className="block h-2 rounded-full bg-tomato"
                    style={{ width: `${(score.score / 10) * 100}%` }}
                  />
                </span>
                <span className="text-right font-display text-xl tabular-nums">{formatScore(score.score)}</span>
              </li>
            ))}
          </ol>
        )}
        {missing.length > 0 ? (
          <p className="mt-3 text-sm text-muted">
            {listNames(missing)} {missing.length === 1 ? "hasn't" : "haven't"} tasted this yet.
          </p>
        ) : null}
      </section>

      <RemoveProduct id={product.id} name={product.name} />
    </div>
  );
}
