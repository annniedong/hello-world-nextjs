import Link from "next/link";
import { ChallengeCard } from "@/components/challenge-card";
import { Hero } from "@/components/hero";
import { ImageCard, type CardImage } from "@/components/image-card";
import { TopToday } from "@/components/top-today";
import { buttonClass } from "@/lib/ui";
import { getViewer } from "@/lib/viewer";
import { getMyVotes } from "@/lib/votes";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;
const MAX_LIMIT = 50;

export default async function Home(props: PageProps<"/">) {
  const { limit: rawLimit } = await props.searchParams;
  const parsed = Number(Array.isArray(rawLimit) ? rawLimit[0] : rawLimit);
  const limit = Number.isFinite(parsed)
    ? Math.min(MAX_LIMIT, Math.max(PAGE_SIZE, Math.round(parsed / PAGE_SIZE) * PAGE_SIZE))
    : PAGE_SIZE;

  const { supabase, user } = await getViewer();

  const { data, error } = await supabase
    .from("images")
    .select("id, storage_path, created_at, captions(id, content, score, style)")
    .order("created_at", { ascending: false })
    .limit(limit);

  const images = (data ?? []) as CardImage[];
  const myVotes = await getMyVotes(
    supabase,
    user?.id,
    images.flatMap((image) => image.captions.map((c) => c.id)),
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      {!user && <Hero />}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="feed-title">
          <h2
            id="feed-title"
            className="mb-4 font-display text-2xl font-bold tracking-tight"
          >
            Fresh captions
          </h2>

          {error ? (
            <p role="alert" className="text-down">
              Couldn&apos;t load the feed. Refresh to try again.
            </p>
          ) : images.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="font-display text-xl font-bold">Nothing here yet</p>
              <p className="mt-1 text-muted">Be the first to caption a photo.</p>
              <Link href="/create" className={`${buttonClass("primary")} mt-4`}>
                Add a photo
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {images.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  myVotes={myVotes}
                  signedIn={Boolean(user)}
                />
              ))}
              {images.length === limit && limit < MAX_LIMIT && (
                <Link
                  href={`/?limit=${limit + PAGE_SIZE}`}
                  scroll={false}
                  className={`${buttonClass("secondary", "lg")} self-center`}
                >
                  Load more
                </Link>
              )}
            </div>
          )}
        </section>

        <aside className="order-first flex flex-col gap-4 lg:sticky lg:top-24 lg:order-last lg:self-start">
          <ChallengeCard />
          <div className="hidden lg:block">
            <TopToday />
          </div>
        </aside>
      </div>
    </main>
  );
}
