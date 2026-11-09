"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addManualProduct, addMsProduct, searchFood } from "@/app/actions";
import { Plate } from "@/components/plate";
import type { SearchHit } from "@/lib/types";

export function AddProduct() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [message, setMessage] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualImage, setManualImage] = useState("");
  const [manualError, setManualError] = useState("");
  const [pending, startTransition] = useTransition();
  const [addingId, setAddingId] = useState<string | null>(null);

  function open() {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }

  function close() {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    startTransition(async () => {
      const result = await searchFood(query);
      if (!result.ok) {
        setHits([]);
        setMessage(result.error);
        return;
      }
      setHits(result.hits);
      setMessage(
        result.hits.length
          ? "Closest matches from the M&S food catalogue."
          : "Nothing in the M&S food catalogue for that.",
      );
    });
  }

  function onAddHit(hit: SearchHit) {
    if (hit.onBoardId) {
      close();
      router.push(`/product/${hit.onBoardId}`);
      return;
    }
    setAddingId(hit.msId);
    setMessage("");
    startTransition(async () => {
      const result = await addMsProduct(hit);
      setAddingId(null);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      close();
      router.push(`/product/${result.id}`);
    });
  }

  function onManual(event: FormEvent) {
    event.preventDefault();
    setManualError("");
    startTransition(async () => {
      const result = await addManualProduct(manualName, manualImage);
      if (!result.ok) {
        setManualError(result.error);
        return;
      }
      setManualName("");
      setManualImage("");
      close();
      router.push(`/product/${result.id}`);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex h-11 items-center justify-center rounded-full bg-tomato px-4 text-sm font-semibold text-white hover:bg-ink"
      >
        Add a product
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => {
          setAddingId(null);
        }}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl tracking-tight">Add a product</h2>
              <p className="mt-1 text-sm text-muted">
                Search the M&S food catalogue and drop it straight onto the board.
              </p>
            </div>
            <button type="button" onClick={close} className="text-sm text-muted">
              Close
            </button>
          </div>

          <form onSubmit={onSearch} className="mt-5 flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Custard cream, dot cake, soup…"
              aria-label="Search M&S food"
              className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 text-sm"
            />
            <button
              type="submit"
              disabled={pending && !addingId}
              className="h-11 rounded-full bg-tomato px-4 text-sm font-semibold text-white hover:bg-ink disabled:opacity-50"
            >
              {pending && !addingId ? "Searching…" : "Search"}
            </button>
          </form>
          {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}

          <ul className="mt-4 space-y-2">
            {hits.map((hit) => (
              <li key={hit.msId} className="flex items-center gap-3 rounded-2xl border border-line p-2">
                <Plate
                  image={hit.image}
                  name={hit.name}
                  alt=""
                  size={160}
                  className="h-14 w-14 shrink-0 rounded-xl"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{hit.name}</p>
                  <p className="text-sm text-muted">{hit.weight ?? "M&S food"}</p>
                </div>
                <button
                  type="button"
                  disabled={addingId === hit.msId}
                  onClick={() => onAddHit(hit)}
                  className="h-10 shrink-0 rounded-full border border-line px-3 text-sm hover:border-ink disabled:opacity-50"
                >
                  {hit.onBoardId ? "Open" : addingId === hit.msId ? "Adding…" : "Add"}
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={onManual} className="mt-6 border-t border-line pt-5">
            <h3 className="font-medium">Or add it by name</h3>
            <p className="mt-1 text-sm text-muted">
              Use this if the catalogue search misses it. An image link is optional.
            </p>
            <div className="mt-3 grid gap-2">
              <input
                value={manualName}
                onChange={(event) => setManualName(event.target.value)}
                placeholder="Product name"
                aria-label="Product name"
                className="h-11 rounded-xl border border-line bg-paper px-3 text-sm"
              />
              <input
                value={manualImage}
                onChange={(event) => setManualImage(event.target.value)}
                placeholder="https:// image link, optional"
                aria-label="Image link"
                className="h-11 rounded-xl border border-line bg-paper px-3 text-sm"
              />
            </div>
            {manualError ? <p className="mt-2 text-sm text-tomato">{manualError}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="mt-3 h-11 rounded-full bg-tomato px-4 text-sm font-semibold text-white hover:bg-ink disabled:opacity-50"
            >
              Add to the board
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
