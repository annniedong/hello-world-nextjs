import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { Pigeon } from "@/components/pigeon";
import { Skyline } from "@/components/skyline";
import { buttonClass } from "@/lib/ui";

const STEPS = [
  {
    n: "1",
    bg: "var(--primary)",
    fg: "#fff",
    title: "Snap",
    body: "Upload a photo from your commute, campus, or weekend.",
  },
  {
    n: "2",
    bg: "var(--blue)",
    fg: "#fff",
    title: "Pick a line",
    body: "Jaded New Yorker, Midwest tourist, or a very smug pigeon.",
  },
  {
    n: "3",
    bg: "var(--yellow)",
    fg: "var(--yellow-foreground)",
    title: "Vote",
    body: "AI writes three captions. Everyone picks the funniest.",
  },
];

export function Hero() {
  return (
    <section className="relative mb-10 overflow-hidden rounded-[2rem] border-2 border-border bg-surface bg-subway-tiles">
      <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-44 w-full text-surface-2" />

      <div className="relative grid items-center gap-6 px-6 pb-8 pt-10 sm:px-10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="inline-flex rounded-full border-2 border-border bg-background px-3 py-1 text-xs font-black uppercase tracking-widest text-muted">
            Made for people who live online and in New York
          </p>
          <h1 className="mt-4 max-w-xl text-balance font-display text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl">
            Caption the{" "}
            <span className="whitespace-nowrap rounded-2xl bg-yellow px-3 text-yellow-foreground">
              city.
            </span>
          </h1>
          <p className="mt-4 max-w-md text-lg font-semibold text-muted">
            Drop a photo, choose who&apos;s narrating, and let the room decide
            which caption wins.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/login?next=%2Fcreate" className={buttonClass("primary", "lg")}>
              Get started
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link href="/vote" className={buttonClass("secondary", "lg")}>
              Just browse
            </Link>
          </div>
        </div>

        <div className="hidden justify-self-center md:block">
          <Pigeon size={190} flapping />
        </div>
      </div>

      <ol className="relative grid gap-3 px-6 pb-8 sm:grid-cols-3 sm:px-10">
        {STEPS.map(({ n, bg, fg, title, body }) => (
          <li
            key={title}
            className="flex gap-3 rounded-2xl border-2 border-border bg-background/95 p-4"
          >
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-black"
              style={{ background: bg, color: fg }}
            >
              {n}
            </span>
            <div>
              <p className="font-extrabold">{title}</p>
              <p className="mt-0.5 text-sm font-semibold text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
