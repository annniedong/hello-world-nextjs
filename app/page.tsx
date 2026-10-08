import Link from "next/link";
import { ImageCard, type CardImage } from "@/components/image-card";
import { createClient } from "@/lib/supabase/server";
import { todaysChallenge } from "@/lib/voices";
import { getMyVotes } from "@/lib/votes";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("images")
    .select("id, storage_path, created_at, captions(id, content, score, style)")
    .order("created_at", { ascending: false })
    .limit(20);

  const images = (data ?? []) as CardImage[];
  const myVotes = await getMyVotes(
    supabase,
    user?.id,
    images.flatMap((image) => image.captions.map((c) => c.id)),
  );

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <section className="mb-8 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Today&apos;s challenge
        </p>
        <p className="mt-1 text-lg font-medium">{todaysChallenge()}</p>
        <Link
          href="/create"
          className="mt-4 inline-block rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          Add a photo
        </Link>
      </section>

      <h1 className="mb-4 text-2xl font-semibold tracking-tight">
        Fresh captions
      </h1>
      {error ? (
        <p className="text-red-600">Couldn&apos;t load the feed: {error.message}</p>
      ) : images.length === 0 ? (
        <p className="text-zinc-500">
          Nothing here yet. Be the first to add a photo.
        </p>
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
        </div>
      )}
    </main>
  );
}
