export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function uniqueId(base: string, used: Set<string>) {
  const root = base || "item";
  let id = root;
  let n = 2;
  while (used.has(id)) {
    id = `${root}-${n}`;
    n += 1;
  }
  return id;
}

export function isHalfStep(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 10) return false;
  return Math.abs(value * 2 - Math.round(value * 2)) < 1e-6;
}
