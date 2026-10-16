import Link from "next/link";
import { Pigeon } from "@/components/pigeon";
import { VoteButtons } from "@/components/vote-buttons";
import { getTopCaptions } from "@/lib/queries";
import { photoUrl } from "@/lib/storage";
import { buttonClass } from "@/lib/ui";
import { getViewer } from "@/lib/viewer";
import { getMyVotes } from "@/lib/votes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Top captions" };

const PERIODS = {
  today: { label: "Today", hours: 24 },
  week: { label: "This week", hours: 24 * 7 },
  all: { label: "All time", hours: null },
} as const;

type Period = keyof typeof PERIODS;

const RANK_STYLE = [
  "bg-yellow text-yellow-foreground shadow-[0_3px_0_var(--yellow-dark)]",
  "bg-line-gray/30 text-foreground shadow-[0_3px_0_var(--line-gray)]",
  "bg-orange/25 text-foreground shadow-[0_3px_0_var(--orange)]",
];

export default async function TopPage(props: PageProps<"/top">) {
  const { period: rawPeriod } = await props.searchParams;
  const period: Period =
    typeof rawPeriod === "string" && rawPeriod in PERIODS
      ? (rawPeriod as Period)
      : "today";

  const { supabase, user } = await getViewer();
  const { captions, error } = await getTopCaptions(supabase, {
    hours: PERIODS[period].hours,
    limit: 10,
  });
  const myVotes = await getMyVotes(
    supabase,
    user?.id,
    captions.map((c) => c.id),
  );

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="font-display text-4xl font-black tracking-tight">
        Top captions
      </h1>
      <p className="mt-1 font-semibold text-muted">
        The funniest captions in the city, ranked by votes.
      </p>

      <nav aria-label="Time range" className="mb-6 mt-5 flex flex-wrap gap-2">
        {(Object.keys(PERIODS) as Period[]).map((key) => (
          <Link
            key={key}
            href={`/top?period=${key}`}
            aria-current={key === period ? "page" : undefined}
            className={`rounded-xl border-2 px-4 py-2 text-sm font-extrabold uppercase tracking-wide transition-colors ${
              key === period
                ? "border-blue bg-blue/10 text-blue"
                : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            {PERIODS[key].label}
          </Link>
        ))}
      </nav>

      {error ? (
        <p role="alert" className="font-bold text-danger">
          Couldn&apos;t load the leaderboard. Refresh to try again.
        </p>
      ) : captions.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-border p-10 text-center">
          <Pigeon size={100} />
          <p className="mt-2 font-display text-2xl font-black">No votes yet</p>
          <p className="mt-1 font-semibold text-muted">
            Nothing has been voted on for this time range.
          </p>
          <Link href="/vote" className={`${buttonClass("primary")} mt-4`}>
            Go rate some photos
          </Link>
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          {captions.map((caption, index) => (
            <li
              key={caption.id}
              className="flex items-center gap-3 rounded-3xl border-2 border-border bg-surface p-3 sm:gap-4"
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-base font-black ${
                  RANK_STYLE[index] ?? "bg-surface-2 text-muted"
                }`}
              >
                {index + 1}
              </span>
              <Link
                href={`/image/${caption.images.id}`}
                aria-label="Open this photo"
                className="shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl(caption.images.storage_path)}
                  alt=""
                  loading="lazy"
                  className="h-16 w-16 rounded-2xl border-2 border-border object-cover"
                />
              </Link>
              <p className="flex-1 font-bold leading-snug">{caption.content}</p>
              <VoteButtons
                captionId={caption.id}
                score={caption.score}
                myVote={myVotes.get(caption.id) ?? 0}
                signedIn={Boolean(user)}
              />
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
