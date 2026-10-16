import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons";
import { ImageCard, type CardImage } from "@/components/image-card";
import { ShareButton } from "@/components/share-button";
import { pickOne } from "@/lib/random";
import { buttonClass } from "@/lib/ui";
import { getViewer } from "@/lib/viewer";
import { getMyVotes } from "@/lib/votes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rate photos" };

type Row = CardImage & { user_id: string };

const SELECT =
  "id, user_id, storage_path, created_at, captions(id, content, score, style)";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VotePage(props: PageProps<"/vote">) {
  const params = await props.searchParams;
  const photoId = first(params.photo);
  const skipId = first(params.skip);

  const { supabase, user } = await getViewer();

  const { data } = await supabase
    .from("images")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(60);
  const images = (data ?? []) as Row[];
  const myVotes = await getMyVotes(
    supabase,
    user?.id,
    images.flatMap((image) => image.captions.map((c) => c.id)),
  );

  const unrated = images.filter(
    (image) =>
      image.captions.length > 0 &&
      (!user ||
        (image.user_id !== user.id &&
          !image.captions.some((c) => myVotes.has(c.id)))),
  );

  // Pick once and put it in the URL, so refreshing after a vote keeps the
  // same photo on screen instead of swapping in a new random one.
  if (!photoId || !UUID.test(photoId)) {
    const pool = unrated.filter((image) => image.id !== skipId);
    const pick = pickOne(pool.length > 0 ? pool : unrated);
    if (pick) redirect(`/vote?photo=${pick.id}`);

    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-border bg-surface p-10 text-center shadow-sm">
          <p className="font-display text-3xl font-bold">You&apos;re all caught up</p>
          <p className="mx-auto mt-2 max-w-sm text-muted">
            You&apos;ve rated every photo for now. Add one of your own and check
            back later for new ones.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/create" className={buttonClass("primary", "lg")}>
              Add a photo
            </Link>
            <Link href="/top" className={buttonClass("secondary", "lg")}>
              See the top captions
            </Link>
          </div>
        </div>
      </main>
    );
  }

  let current = images.find((image) => image.id === photoId);
  if (!current) {
    const { data: single } = await supabase
      .from("images")
      .select(SELECT)
      .eq("id", photoId)
      .maybeSingle();
    current = (single as Row | null) ?? undefined;
  }
  if (!current) redirect("/vote");

  const remaining = unrated.filter((image) => image.id !== current.id).length;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Rate photos
          </h1>
          <p className="mt-1 text-muted">Which caption is the funniest?</p>
        </div>
        {user && (
          <p className="rounded-full bg-surface-2 px-3 py-1 text-sm font-medium">
            {remaining === 0 ? "Last one" : `${remaining} more to rate`}
          </p>
        )}
      </div>

      {!user && (
        <p className="mb-4 rounded-2xl border border-border bg-surface p-4 text-sm">
          <Link
            href={`/login?next=${encodeURIComponent("/vote")}`}
            className="font-semibold underline"
          >
            Sign in
          </Link>{" "}
          to cast votes and keep track of what you&apos;ve rated.
        </p>
      )}

      <ImageCard
        image={current}
        myVotes={myVotes}
        signedIn={Boolean(user)}
        linkToPage={false}
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href={`/vote?skip=${current.id}`}
          className={buttonClass("primary", "lg")}
        >
          Next photo
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <ShareButton path={`/image/${current.id}`} />
      </div>
    </main>
  );
}
