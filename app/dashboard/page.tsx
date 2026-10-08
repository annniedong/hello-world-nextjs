import Link from "next/link";
import { redirect } from "next/navigation";
import { ImageCard, type CardImage } from "@/components/image-card";
import { createClient } from "@/lib/supabase/server";
import { getMyVotes } from "@/lib/votes";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data }] = await Promise.all([
    supabase.from("profiles").select("first_name").eq("id", user.id).single(),
    supabase
      .from("images")
      .select("id, storage_path, created_at, captions(id, content, score, style)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const images = (data ?? []) as CardImage[];
  const myVotes = await getMyVotes(
    supabase,
    user.id,
    images.flatMap((image) => image.captions.map((c) => c.id)),
  );

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}!
      </h1>
      <h2 className="mb-4 mt-8 text-xl font-semibold">Your photos</h2>
      {images.length === 0 ? (
        <p className="text-zinc-500">
          You haven&apos;t added any photos yet.{" "}
          <Link href="/create" className="underline">
            Add your first one.
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {images.map((image) => (
            <ImageCard key={image.id} image={image} myVotes={myVotes} signedIn />
          ))}
        </div>
      )}
    </main>
  );
}
