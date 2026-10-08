import { notFound } from "next/navigation";
import { ImageCard, type CardImage } from "@/components/image-card";
import { createClient } from "@/lib/supabase/server";
import { getMyVotes } from "@/lib/votes";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ImagePage(props: PageProps<"/image/[id]">) {
  const { id } = await props.params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <ImageCard
        image={image}
        myVotes={myVotes}
        signedIn={Boolean(user)}
        linkToPage={false}
      />
    </main>
  );
}
