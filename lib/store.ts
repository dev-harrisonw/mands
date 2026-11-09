import fs from "node:fs";
import path from "node:path";
import { seedState } from "./seed";
import type { Notice, Product, Rating, State } from "./types";

const FILE = path.join(process.cwd(), "data", "leaderboard.json");

let chain: Promise<void> = Promise.resolve();

export class ReadOnlyBoardError extends Error {
  constructor() {
    super("Scores can't be saved on this host. This copy of the board is read-only.");
    this.name = "ReadOnlyBoardError";
  }
}

function write(state: State) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    const tmp = `${FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, FILE);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") throw new ReadOnlyBoardError();
    throw error;
  }
}

function read(): State {
  if (!fs.existsSync(FILE)) {
    const seeded = seedState();
    try {
      write(seeded);
    } catch (error) {
      if (!(error instanceof ReadOnlyBoardError)) throw error;
    }
    return seeded;
  }

  const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as Partial<State>;
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

export function getState() {
  return read();
}

export function update<T>(change: (state: State) => T) {
  let result!: T;
  const run = chain.then(() => {
    const draft = structuredClone(read());
    result = change(draft);
    write(draft);
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run.then(() => result);
}
