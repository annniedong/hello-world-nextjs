import Link from "next/link";
import { VoteButtons } from "@/components/vote-buttons";
import { getTopCaptions } from "@/lib/queries";
import { photoUrl } from "@/lib/storage";
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
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Top captions
      </h1>
      <p className="mt-1 text-muted">The funniest captions, ranked by votes.</p>

      <nav aria-label="Time range" className="mb-6 mt-5 flex gap-2 text-sm">
        {(Object.keys(PERIODS) as Period[]).map((key) => (
          <Link
            key={key}
            href={`/top?period=${key}`}
            aria-current={key === period ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 font-medium transition-colors ${
              key === period
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {PERIODS[key].label}
          </Link>
        ))}
      </nav>

      {error ? (
        <p role="alert" className="text-down">
          Couldn&apos;t load the leaderboard. Refresh to try again.
        </p>
      ) : captions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-xl font-bold">No votes yet</p>
          <p className="mt-1 text-muted">
            Nothing has been voted on for this time range.
          </p>
          <Link href="/vote" className="mt-3 inline-block font-semibold underline">
            Go rate some photos
          </Link>
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          {captions.map((caption, index) => (
            <li
              key={caption.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm sm:gap-4"
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                  index === 0
                    ? "bg-accent text-accent-foreground"
                    : "bg-surface-2 text-muted"
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
                  className="h-16 w-16 rounded-xl object-cover"
                />
              </Link>
              <p className="flex-1 font-medium leading-snug">{caption.content}</p>
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
