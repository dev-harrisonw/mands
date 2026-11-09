"use client";

import { useState, useTransition, type FormEvent } from "react";
import { addPerson, setTaster } from "@/app/actions";
import type { Person } from "@/lib/types";

export function PersonSwitcher({
  people,
  tasterId,
}: {
  people: Person[];
  tasterId: string | null;
}) {
  const [current, setCurrent] = useState(tasterId ?? "");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSelect(value: string) {
    setCurrent(value);
    setError("");
    startTransition(async () => {
      const result = await setTaster(value);
      if (!result.ok) setCurrent(tasterId ?? "");
    });
  }

  function onAdd(event: FormEvent) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await addPerson(name);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setName("");
      setAdding(false);
      setCurrent(result.id);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 text-sm text-muted">
        <span className="whitespace-nowrap">Scoring as</span>
        <select
          aria-label="Who is scoring"
          value={current}
          disabled={pending}
          onChange={(event) => onSelect(event.target.value)}
          className="h-11 min-w-36 rounded-full border border-line bg-card px-3 text-sm text-ink"
        >
          <option value="">Pick your name</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </label>
      {adding ? (
        <form onSubmit={onAdd} className="flex items-center gap-2">
          <input
            aria-label="New taster name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            maxLength={32}
            className="h-11 w-36 rounded-full border border-line bg-card px-3 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="h-11 rounded-full bg-tomato px-3 text-sm font-semibold text-white hover:bg-ink disabled:opacity-50"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setError("");
            }}
            className="h-11 px-2 text-sm text-muted"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="h-11 rounded-full px-2 text-sm text-ink underline-offset-2 hover:underline"
        >
          Add someone
        </button>
      )}
      {error ? <p className="w-full text-sm text-tomato">{error}</p> : null}
    </div>
  );
}
