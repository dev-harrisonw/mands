import fs from "node:fs";
import path from "node:path";
import { BlobNotFoundError, BlobPreconditionFailedError, get, head, put } from "@vercel/blob";
import { seedState } from "./seed";
import type { Notice, Product, Rating, State } from "./types";

const FILE = path.join(process.cwd(), "data", "leaderboard.json");
const BLOB_PATH = "leaderboard.json";

let chain: Promise<unknown> = Promise.resolve();

export class ReadOnlyBoardError extends Error {
  constructor() {
    super("Scores can't be saved on this host. This copy of the board is read-only.");
    this.name = "ReadOnlyBoardError";
  }
}

function usingBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function normalize(parsed: Partial<State>): State {
  if (!Array.isArray(parsed.products) || !Array.isArray(parsed.people) || !Array.isArray(parsed.ratings)) {
    throw new Error("The leaderboard file is unreadable.");
  }
  return {
    people: parsed.people,
    products: parsed.products.map((product) => ({
      ...product,
      addedBy: product.addedBy ?? null,
    })) as Product[],
    ratings: parsed.ratings.map((rating) => ({
      ...rating,
      addedAt: rating.addedAt ?? null,
    })) as Rating[],
    notices: Array.isArray(parsed.notices) ? (parsed.notices as Notice[]) : [],
  };
}

function readFile(): State | null {
  if (!fs.existsSync(FILE)) return null;
  return normalize(JSON.parse(fs.readFileSync(FILE, "utf8")) as Partial<State>);
}

function writeFile(state: State) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    const tmp = `${FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, FILE);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM" || code === "ENOENT") {
      throw new ReadOnlyBoardError();
    }
    throw error;
  }
}

async function saveBlob(state: State, etag: string | null) {
  return put(BLOB_PATH, JSON.stringify(state), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
    ...(etag ? { ifMatch: etag } : { allowOverwrite: false }),
  });
}

function isConflict(error: unknown) {
  return (
    error instanceof BlobPreconditionFailedError ||
    (error instanceof Error && error.message.includes("ETag mismatch"))
  );
}

async function readBlob(): Promise<{ state: State; etag: string }> {
  try {
    const meta = await head(BLOB_PATH);
    const current = await get(BLOB_PATH, { access: "private", useCache: false });
    if (current?.statusCode !== 200) throw new Error("The leaderboard could not be read.");
    const text = await new Response(current.stream).text();
    return { state: normalize(JSON.parse(text) as Partial<State>), etag: meta.etag };
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) throw error;
  }

  const seeded = readFile() ?? seedState();
  try {
    const saved = await saveBlob(seeded, null);
    return { state: seeded, etag: saved.etag };
  } catch (error) {
    const again = await get(BLOB_PATH, { access: "private", useCache: false });
    if (again?.statusCode === 200) {
      const text = await new Response(again.stream).text();
      return { state: normalize(JSON.parse(text) as Partial<State>), etag: again.blob.etag };
    }
    throw error;
  }
}

export async function getState() {
  if (usingBlob()) return (await readBlob()).state;

  const existing = readFile();
  if (existing) return existing;
  const seeded = seedState();
  try {
    writeFile(seeded);
  } catch (error) {
    if (!(error instanceof ReadOnlyBoardError)) throw error;
  }
  return seeded;
}

export async function update<T>(change: (state: State) => T) {
  const run = chain.then(async () => {
    if (!usingBlob()) {
      const draft = structuredClone(readFile() ?? seedState());
      const result = change(draft);
      writeFile(draft);
      return result;
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { state, etag } = await readBlob();
      const draft = structuredClone(state);
      const result = change(draft);
      try {
        await saveBlob(draft, etag);
        return result;
      } catch (error) {
        if (isConflict(error) && attempt < 4) continue;
        throw error;
      }
    }
    throw new Error("Couldn't save the board.");
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run as Promise<T>;
}
