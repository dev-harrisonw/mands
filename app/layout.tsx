import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { NoticeStrip } from "@/components/notices";
import { PersonSwitcher } from "@/components/person-switcher";
import { liveNotices } from "@/lib/rank";
import { getSession } from "@/lib/session";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Don't Panic — M&S food leaderboard",
    template: "%s · Don't Panic",
  },
  description: "A Don't Panic board for scoring M&S food out of 10.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#d40075",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { state, taster } = await getSession();

  return (
    <html lang="en-GB" className={`${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-30 border-b border-line bg-white">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
            <Link href="/" className="shrink-0" title="Don't Panic leaderboard">
              <Image
                src="/logo.png"
                alt="Don't Panic"
                width={168}
                height={96}
                priority
                className="h-14 w-auto"
              />
            </Link>
            <Nav />
            <div className="w-full sm:ml-auto sm:w-auto">
              <PersonSwitcher
                key={taster?.id ?? "none"}
                people={state.people}
                tasterId={taster?.id ?? null}
              />
            </div>
          </div>
          <NoticeStrip notices={liveNotices(state)} />
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 pb-10 text-sm text-muted">
          <p>Scores stay on this board, with the name of whoever added them.</p>
          <a
            href="https://dontpanicprojects.com"
            className="font-semibold text-tomato hover:underline"
          >
            dontpanicprojects.com
          </a>
        </footer>
      </body>
    </html>
  );
}
