import { HeadToHead } from "@/components/head-to-head";
import { formatAverage, formatScore } from "@/lib/format";
import { defaultMatchup, tasterStats } from "@/lib/rank";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Head to head",
};

export default async function PeoplePage() {
  const { state, taster } = await getSession();
  const stats = tasterStats(state, taster?.id ?? null);
  const matchup = defaultMatchup(state, taster?.id ?? null);

  return (
    <div>
      <h1 className="font-display text-5xl tracking-tight">Score against each other</h1>
      <p className="mt-2 max-w-xl text-muted">
        On every product you&apos;ve both scored, the higher number wins. Draws stay draws.
      </p>

      {matchup ? (
        <div className="mt-8">
          <HeadToHead
            people={state.people}
            products={state.products}
            ratings={state.ratings}
            initialA={matchup.a}
            initialB={matchup.b}
          />
        </div>
      ) : (
        <p className="mt-8 text-muted">Add a second taster before a head to head means anything.</p>
      )}

      <section className="mt-12">
        <h2 className="font-display text-3xl tracking-tight">Who&apos;s been tasting</h2>
        <p className="mt-1 text-sm text-muted">Ranked by how many products they&apos;ve scored.</p>
        <div className="card mt-4 overflow-x-auto rounded-3xl">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Taster</th>
                <th className="px-4 py-3 font-medium">Scored</th>
                <th className="px-4 py-3 font-medium">Their average</th>
                <th className="px-4 py-3 font-medium">High</th>
                <th className="px-4 py-3 font-medium">Low</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr
                  key={stat.id}
                  className={`border-t border-line ${stat.you ? "bg-blush" : ""}`}
                >
                  <td className="px-4 py-3 tabular-nums text-muted">{stat.rank ?? "–"}</td>
                  <td className="px-4 py-3 font-medium">
                    {stat.name}
                    {stat.you ? <span className="ml-2 text-xs font-medium text-tomato">you</span> : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{stat.count}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {stat.average == null ? "—" : formatAverage(stat.average)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {stat.high == null ? "—" : formatScore(stat.high)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {stat.low == null ? "—" : formatScore(stat.low)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
