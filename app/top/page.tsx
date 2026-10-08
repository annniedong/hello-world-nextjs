import Link from "next/link";
import { VoteButtons } from "@/components/vote-buttons";
import { createClient } from "@/lib/supabase/server";
import { photoUrl } from "@/lib/storage";
import { hoursAgo } from "@/lib/time";
import { getMyVotes } from "@/lib/votes";

export const dynamic = "force-dynamic";

const PERIODS = {
  today: { label: "Today", hours: 24 },
  week: { label: "This week", hours: 24 * 7 },
  all: { label: "All time", hours: null },
} as const;

type Period = keyof typeof PERIODS;

type TopCaption = {
  id: string;
  content: string;
  score: number;
  images: { id: string; storage_path: string };
};

export default async function TopPage(props: PageProps<"/top">) {
  const { period: rawPeriod } = await props.searchParams;
  const period: Period =
    typeof rawPeriod === "string" && rawPeriod in PERIODS
      ? (rawPeriod as Period)
      : "today";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("captions")
    .select("id, content, score, images(id, storage_path)")
    .gt("vote_count", 0)
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);

  const hours = PERIODS[period].hours;
  if (hours) {
    query = query.gte("created_at", hoursAgo(hours));
  }

  const { data, error } = await query;
  const captions = (data ?? []) as unknown as TopCaption[];
  const myVotes = await getMyVotes(
    supabase,
    user?.id,
    captions.map((c) => c.id),
  );

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">
        Top captions
      </h1>
      <nav className="mb-6 flex gap-2 text-sm">
        {(Object.keys(PERIODS) as Period[]).map((key) => (
          <Link
            key={key}
            href={`/top?period=${key}`}
            className={`rounded-full border px-3 py-1 ${
              key === period
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {PERIODS[key].label}
          </Link>
        ))}
      </nav>

      {error ? (
        <p className="text-red-600">Couldn&apos;t load the leaderboard.</p>
      ) : captions.length === 0 ? (
        <p className="text-zinc-500">
          No votes yet for this period.{" "}
          <Link href="/" className="underline">
            Go vote on something.
          </Link>
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {captions.map((caption, index) => (
            <li
              key={caption.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <span className="w-6 text-center text-lg font-semibold text-zinc-500">
                {index + 1}
              </span>
              <VoteButtons
                captionId={caption.id}
                score={caption.score}
                myVote={myVotes.get(caption.id) ?? 0}
                signedIn={Boolean(user)}
              />
              <p className="flex-1">{caption.content}</p>
              <Link href={`/image/${caption.images.id}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl(caption.images.storage_path)}
                  alt="The photo this caption belongs to"
                  loading="lazy"
                  className="h-16 w-16 rounded object-cover"
                />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
