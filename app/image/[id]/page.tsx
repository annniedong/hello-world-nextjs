import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons";
import { ImageCard, type CardImage } from "@/components/image-card";
import { ShareButton } from "@/components/share-button";
import { buttonClass } from "@/lib/ui";
import { getViewer } from "@/lib/viewer";
import { getMyVotes } from "@/lib/votes";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata = { title: "Photo" };

export default async function ImagePage(props: PageProps<"/image/[id]">) {
  const { id } = await props.params;
  const { new: isNew } = await props.searchParams;
  if (!UUID.test(id)) notFound();

  const { supabase, user } = await getViewer();

  const { data } = await supabase
    .from("images")
    .select("id, storage_path, created_at, captions(id, content, score, style)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const image = data as CardImage;
  const myVotes = await getMyVotes(
    supabase,
    user?.id,
    image.captions.map((c) => c.id),
  );

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      {isNew && (
        <div
          role="status"
          className="mb-5 rounded-2xl border border-border bg-accent/25 p-4"
        >
          <p className="font-display text-lg font-bold">You&apos;re live!</p>
          <p className="text-sm text-muted">
            Share the link so people can vote on your captions.
          </p>
        </div>
      )}

      <ImageCard
        image={image}
        myVotes={myVotes}
        signedIn={Boolean(user)}
        linkToPage={false}
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ShareButton path={`/image/${image.id}`} />
        <Link href="/vote" className={buttonClass("primary")}>
          Rate more photos
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
