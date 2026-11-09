"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeProduct } from "@/app/actions";

export function RemoveProduct({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-10">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Remove ${name} from the board? Its scores go too.`)) return;
          setError("");
          startTransition(async () => {
            const result = await removeProduct(id);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.push("/");
          });
        }}
        className="text-sm text-muted underline-offset-2 hover:text-tomato hover:underline disabled:opacity-50"
      >
        {pending ? "Removing…" : "Remove from the board"}
      </button>
      {error ? <p className="mt-2 text-sm text-tomato">{error}</p> : null}
    </div>
  );
}
