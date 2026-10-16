import Link from "next/link";
import { ArrowRightIcon, CameraIcon, SparkIcon, TrophyIcon } from "@/components/icons";
import { buttonClass } from "@/lib/ui";

const STEPS = [
  {
    icon: CameraIcon,
    title: "Snap",
    body: "Upload a photo from your commute, campus, or weekend.",
  },
  {
    icon: SparkIcon,
    title: "Pick a voice",
    body: "Jaded New Yorker, Midwest tourist, or a very smug pigeon.",
  },
  {
    icon: TrophyIcon,
    title: "Vote",
    body: "AI writes three captions. Everyone picks the funniest.",
  },
];

export function Hero() {
  return (
    <section className="mb-10 overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">
        For people who live online and in New York
      </p>
      <h1 className="mt-3 max-w-3xl text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
        Your city, <span className="rounded-lg bg-accent px-2 text-accent-foreground">captioned</span> by AI.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Drop a photo, choose who&apos;s narrating, and let the room decide which
        caption wins.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/create" className={buttonClass("primary", "lg")}>
          Start captioning
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <Link href="/vote" className={buttonClass("secondary", "lg")}>
          Rate some photos
        </Link>
      </div>

      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, body }, index) => (
          <li key={title} className="flex gap-3 rounded-2xl bg-surface-2 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-background">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">
                {index + 1}. {title}
              </p>
              <p className="mt-0.5 text-sm text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
