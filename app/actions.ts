"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { cleanImageInput } from "@/lib/format";
import { isHalfStep, slugify, uniqueId } from "@/lib/ids";
import { searchMsFood } from "@/lib/ms";
import { getState, ReadOnlyBoardError, update } from "@/lib/store";
import type { MsHit, Notice, SearchHit, State } from "@/lib/types";

const TRANSIENT_MS = 30 * 60 * 1000;

function remember(state: { notices: Notice[] }, notice: Notice) {
  const cutoff = Date.now() - TRANSIENT_MS;
  state.notices = [notice, ...(state.notices ?? [])].filter((item) => Date.parse(item.at) >= cutoff).slice(0, 8);
}

const COOKIE = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 400,
  httpOnly: true,
};

function refresh() {
  revalidatePath("/", "layout");
}

async function save<T>(change: (state: State) => T) {
  try {
    return { ok: true as const, value: await update(change) };
  } catch (error) {
    if (error instanceof ReadOnlyBoardError) return { ok: false as const, error: error.message };
    throw error;
  }
}

export async function setTaster(personId: string) {
  const jar = await cookies();
  if (!personId) {
    jar.delete("tasterId");
    refresh();
    return { ok: true as const };
  }

  const known = (await getState()).people.some((person) => person.id === personId);
  if (!known) return { ok: false as const, error: "That name isn't on the board." };

  jar.set("tasterId", personId, COOKIE);
  refresh();
  return { ok: true as const };
}

export async function addPerson(name: string) {
  const clean = name.trim().replace(/\s+/g, " ");
  if (clean.length < 2) return { ok: false as const, error: "Name needs at least 2 characters." };
  if (clean.length > 32) return { ok: false as const, error: "Keep the name to 32 characters." };

  const saved = await save((state) => {
    const existing = state.people.find((person) => person.name.toLowerCase() === clean.toLowerCase());
    if (existing) return existing.id;
    const used = new Set(state.people.map((person) => person.id));
    const nextId = uniqueId(slugify(clean), used);
    state.people.push({ id: nextId, name: clean });
    return nextId;
  });
  if (!saved.ok) return saved;
  const id = saved.value;

  const jar = await cookies();
  jar.set("tasterId", id, COOKIE);
  refresh();
  return { ok: true as const, id };
}

export async function rate(productId: string, score: number | null) {
  const personId = (await cookies()).get("tasterId")?.value;
  if (!personId) return { ok: false as const, error: "Pick your name first." };
  if (score != null && !isHalfStep(score)) {
    return { ok: false as const, error: "Scores run from 0 to 10, in halves." };
  }

  const saved = await save((state) => {
    const person = state.people.find((item) => item.id === personId);
    const product = state.products.find((item) => item.id === productId);
    if (!person) return { status: "person" as const };
    if (!product) return { status: "product" as const };
    state.ratings = state.ratings.filter(
      (rating) => !(rating.productId === productId && rating.personId === personId),
    );
    const addedAt = new Date().toISOString();
    if (score != null) state.ratings.push({ productId, personId, score, addedAt });
    remember(state, {
      id: `${personId}-${productId}-${addedAt}`,
      personId,
      personName: person.name,
      productId,
      productName: product.name,
      score,
      at: addedAt,
    });
    return { status: "ok" as const, name: person.name };
  });
  if (!saved.ok) return saved;
  const result = saved.value;

  if (result.status === "person") return { ok: false as const, error: "That taster is not on the board." };
  if (result.status === "product") return { ok: false as const, error: "That product is not on the board." };
  refresh();
  return { ok: true as const, name: result.name };
}

export async function searchFood(query: string): Promise<
  { ok: true; hits: SearchHit[] } | { ok: false; error: string }
> {
  try {
    const hits = await searchMsFood(query);
    const state = await getState();
    return {
      ok: true,
      hits: hits.map((hit) => ({
        ...hit,
        onBoardId: state.products.find((product) => product.msId === hit.msId)?.id ?? null,
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return { ok: false, error: message };
  }
}

function acceptedHit(hit: MsHit): MsHit | null {
  const msId = hit.msId?.trim?.() ?? "";
  const name = hit.name?.replace?.(/\s+/g, " ").trim() ?? "";
  const path = hit.path?.trim?.() ?? "";
  if (!/^\d+$/.test(msId) || name.length < 2 || name.length > 160) return null;
  if (!path.startsWith("/food/") || path.length > 300 || path.includes("..")) return null;
  const image =
    hit.image && /^[a-z0-9]+\.(jpg|jpeg|png|webp)$/i.test(hit.image) ? hit.image : null;
  const weight = hit.weight && hit.weight.length < 40 ? hit.weight : null;
  return { msId, name, path, image, weight };
}

export async function addMsProduct(hit: MsHit) {
  const clean = acceptedHit(hit);
  if (!clean) return { ok: false as const, error: "That catalogue result looks incomplete." };

  const addedBy = (await cookies()).get("tasterId")?.value ?? null;
  const saved = await save((state) => {
    const existing = state.products.find((product) => product.msId === clean.msId);
    if (existing) return existing.id;
    const used = new Set(state.products.map((product) => product.id));
    const nextId = uniqueId(`ms-${clean.msId}`, used);
    const person = state.people.find((item) => item.id === addedBy) ?? null;
    state.products.push({
      id: nextId,
      name: clean.name,
      officialName: null,
      image: clean.image,
      weight: clean.weight,
      msId: clean.msId,
      path: clean.path,
      addedBy: person?.id ?? null,
    });
    return nextId;
  });
  if (!saved.ok) return saved;
  const id = saved.value;

  refresh();
  return { ok: true as const, id };
}

export async function addManualProduct(name: string, image: string) {
  const cleanName = name.trim().replace(/\s+/g, " ");
  if (cleanName.length < 2) return { ok: false as const, error: "Give the product a name." };
  if (cleanName.length > 120) return { ok: false as const, error: "That name is too long." };

  let storedImage: string | null = null;
  if (image.trim()) {
    storedImage = cleanImageInput(image);
    if (!storedImage) {
      return { ok: false as const, error: "Image needs to be an https link, or leave it blank." };
    }
  }

  const addedBy = (await cookies()).get("tasterId")?.value ?? null;
  const saved = await save((state) => {
    const used = new Set(state.products.map((product) => product.id));
    const nextId = uniqueId(slugify(cleanName), used);
    const person = state.people.find((item) => item.id === addedBy) ?? null;
    state.products.push({
      id: nextId,
      name: cleanName,
      officialName: null,
      image: storedImage,
      weight: null,
      msId: null,
      path: null,
      addedBy: person?.id ?? null,
    });
    return nextId;
  });
  if (!saved.ok) return saved;
  const id = saved.value;

  refresh();
  return { ok: true as const, id };
}

export async function removeProduct(id: string) {
  const saved = await save((state) => {
    const before = state.products.length;
    state.products = state.products.filter((product) => product.id !== id);
    if (state.products.length === before) return false;
    state.ratings = state.ratings.filter((rating) => rating.productId !== id);
    return true;
  });
  if (!saved.ok) return saved;
  const removed = saved.value;

  if (!removed) return { ok: false as const, error: "That product is already gone." };
  refresh();
  return { ok: true as const };
}
