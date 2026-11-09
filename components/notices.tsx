import Link from "next/link";
import { formatScore, formatWhen } from "@/lib/format";
import type { Notice } from "@/lib/types";

export function NoticeStrip({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) return null;

  return (
    <div className="border-b border-line bg-blush">
      <ul className="mx-auto flex w-full max-w-5xl gap-x-6 overflow-x-auto px-4 py-2 text-sm">
        {notices.map((notice) => (
          <li key={notice.id} className="shrink-0">
            <Link href={`/product/${notice.productId}`} className="hover:text-tomato">
              <span className="font-semibold">{notice.personName}</span>
              {notice.score == null
                ? " cleared their score on "
                : ` added ${formatScore(notice.score)} on `}
              {notice.productName}
              <span className="text-muted"> · {formatWhen(notice.at)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
