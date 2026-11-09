"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Board" },
  { href: "/people", label: "Head to head" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex rounded-full border border-line bg-card p-1">
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              active ? "bg-tomato text-white" : "text-ink hover:bg-blush"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
