import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1 className="font-display text-5xl tracking-tight">Not on the board</h1>
      <p className="mt-3 text-muted">That product isn&apos;t in the tasting.</p>
      <Link href="/" className="mt-6 inline-flex text-sm underline underline-offset-2">
        Back to the leaderboard
      </Link>
    </div>
  );
}
