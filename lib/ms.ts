import type { MsHit } from "./types";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function asHit(item: unknown): MsHit | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const msId = String(row.id ?? "").trim();
  const name = String(row.title ?? "").replace(/\s+/g, " ").trim();
  const path = String(row.seoUrl ?? "").trim();
  const imageValue = String(row.imageUrl ?? "").trim();
  if (!/^\d+$/.test(msId) || name.length < 2 || !path.startsWith("/food/")) return null;
  const image = /^[a-z0-9]+\.(jpg|jpeg|png|webp)$/i.test(imageValue) ? imageValue : null;
  const weightValue = typeof row.weight === "string" ? row.weight.trim() : "";
  return {
    msId,
    name,
    path,
    image,
    weight: weightValue && weightValue.length < 40 ? weightValue : null,
  };
}

export async function searchMsFood(query: string): Promise<MsHit[]> {
  const term = query.trim().slice(0, 80);
  if (term.length < 2) return [];

  const url = new URL("https://www.marksandspencer.com/food/search");
  url.searchParams.set("searchTerm", term);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "text/html",
        "User-Agent": USER_AGENT,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new Error("M&S search didn't respond. Add the product by name instead.");
  }

  if (!response.ok) {
    throw new Error("M&S search didn't respond. Add the product by name instead.");
  }

  const html = await response.text();
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!match) {
    throw new Error("M&S changed its search page. Add the product by name instead.");
  }

  let data: unknown;
  try {
    data = JSON.parse(match[1]);
  } catch {
    throw new Error("M&S changed its search page. Add the product by name instead.");
  }

  const lists = (
    data as {
      props?: {
        pageProps?: { viewModel?: { productSearch?: { productLists?: { ranged?: unknown[]; unranged?: unknown[] } } } };
      };
    }
  ).props?.pageProps?.viewModel?.productSearch?.productLists;

  const items = [...(lists?.ranged ?? []), ...(lists?.unranged ?? [])];
  const hits: MsHit[] = [];
  for (const item of items) {
    const hit = asHit(item);
    if (hit) hits.push(hit);
    if (hits.length === 8) break;
  }
  return hits;
}
