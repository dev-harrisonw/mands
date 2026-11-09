import type { BoardRow, Notice, ScoreLine, State, TasterStat } from "./types";

const TRANSIENT_MS = 30 * 60 * 1000;

export function liveNotices(state: State): Notice[] {
  const cutoff = Date.now() - TRANSIENT_MS;
  return state.notices
    .filter((notice) => Date.parse(notice.at) >= cutoff)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);
}

function round4(value: number) {
  return Math.round(value * 10000) / 10000;
}

function mean(values: number[]) {
  if (values.length === 0) return null;
  return round4(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function boardRows(state: State, youId: string | null): BoardRow[] {
  const withOrder = state.products.map((product, order) => {
    const ratings = state.ratings.filter((rating) => rating.productId === product.id);
    const yours = youId
      ? ratings.find((rating) => rating.personId === youId)?.score ?? null
      : null;
    return {
      id: product.id,
      name: product.name,
      officialName: product.officialName,
      image: product.image,
      weight: product.weight,
      path: product.path,
      average: mean(ratings.map((rating) => rating.score)),
      count: ratings.length,
      rank: null as number | null,
      yourScore: yours,
      order,
    };
  });

  const ranked = withOrder
    .filter((row) => row.average != null)
    .sort((a, b) => b.average! - a.average! || a.order - b.order);
  ranked.forEach((row, index) => {
    row.rank = index + 1;
  });

  const waiting = withOrder
    .filter((row) => row.average == null)
    .sort((a, b) => a.order - b.order);

  return [...ranked, ...waiting].map((row) => ({
    id: row.id,
    name: row.name,
    officialName: row.officialName,
    image: row.image,
    weight: row.weight,
    path: row.path,
    average: row.average,
    count: row.count,
    rank: row.rank,
    yourScore: row.yourScore,
  }));
}

export function productScores(state: State, productId: string, youId: string | null): ScoreLine[] {
  return state.ratings
    .filter((rating) => rating.productId === productId)
    .map((rating) => ({
      personId: rating.personId,
      name: state.people.find((person) => person.id === rating.personId)?.name ?? "Someone",
      score: rating.score,
      you: rating.personId === youId,
      addedAt: rating.addedAt ?? null,
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

export function tasterStats(state: State, youId: string | null): TasterStat[] {
  const stats = state.people.map((person) => {
    const scores = state.ratings
      .filter((rating) => rating.personId === person.id)
      .map((rating) => rating.score);
    return {
      id: person.id,
      name: person.name,
      count: scores.length,
      average: mean(scores),
      high: scores.length ? Math.max(...scores) : null,
      low: scores.length ? Math.min(...scores) : null,
      rank: null as number | null,
      you: person.id === youId,
    };
  });

  stats.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  let place = 0;
  let seen = 0;
  let lastCount = -1;
  for (const stat of stats) {
    seen += 1;
    if (stat.count === 0) continue;
    if (stat.count !== lastCount) {
      place = seen;
      lastCount = stat.count;
    }
    stat.rank = place;
  }

  return stats;
}

export function defaultMatchup(state: State, youId: string | null) {
  if (state.people.length < 2) return null;
  const you = youId && state.people.some((person) => person.id === youId) ? youId : state.people[0].id;
  const yours = new Set(
    state.ratings.filter((rating) => rating.personId === you).map((rating) => rating.productId),
  );
  const overlap = new Map<string, number>();
  for (const rating of state.ratings) {
    if (rating.personId !== you && yours.has(rating.productId)) {
      overlap.set(rating.personId, (overlap.get(rating.personId) ?? 0) + 1);
    }
  }

  let opponent = state.people.find((person) => person.id !== you)?.id ?? null;
  let best = -1;
  for (const person of state.people) {
    if (person.id === you) continue;
    const count = overlap.get(person.id) ?? 0;
    if (count > best) {
      best = count;
      opponent = person.id;
    }
  }

  return opponent ? { a: you, b: opponent } : null;
}
