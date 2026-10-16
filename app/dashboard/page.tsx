import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon } from "@/components/icons";
import { photoUrl } from "@/lib/storage";
import { timeAgo } from "@/lib/time";
import { buttonClass } from "@/lib/ui";
import { getViewer, getViewerProfile } from "@/lib/viewer";

export const dynamic = "force-dynamic";
export const metadata = { title: "My photos" };

type Tile = {
  id: string;
  storage_path: string;
  created_at: string;
  captions: { id: string; content: string; score: number; vote_count: number }[];
};

export default async function DashboardPage() {
  const { supabase, user } = await getViewer();

  if (!user) {
    redirect("/login?next=%2Fdashboard");
  }

  const profile = await getViewerProfile();
  const { data } = await supabase
    .from("images")
    .select("id, storage_path, created_at, captions(id, content, score, vote_count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const tiles = (data ?? []) as Tile[];
  const votesReceived = tiles.reduce(
    (total, tile) => total + tile.captions.reduce((sum, c) => sum + c.vote_count, 0),
    0,
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {profile?.first_name ? `${profile.first_name}'s photos` : "My photos"}
          </h1>
          <p className="mt-1 text-muted">
            {tiles.length} {tiles.length === 1 ? "photo" : "photos"} ·{" "}
            {votesReceived} {votesReceived === 1 ? "vote" : "votes"} received
          </p>
        </div>
        <Link href="/create" className={buttonClass("primary")}>
          <PlusIcon className="h-4 w-4" />
          Add photo
        </Link>
      </div>

      {tiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-xl font-bold">No photos yet</p>
          <p className="mt-1 text-muted">
            Add one and watch the votes come in.
          </p>
          <Link href="/create" className={`${buttonClass("primary")} mt-4`}>
            Add your first photo
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {tiles.map((tile) => {
            const best = [...tile.captions].sort((a, b) => b.score - a.score)[0];
            return (
              <li key={tile.id}>
                <Link
                  href={`/image/${tile.id}`}
                  className="block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl(tile.storage_path)}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                  <div className="p-3">
                    {best && (
                      <p className="line-clamp-2 text-sm font-medium leading-snug">
                        {best.content}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted">
                      {best ? `Best: ${best.score > 0 ? "+" : ""}${best.score}` : "No captions"} ·{" "}
                      {timeAgo(tile.created_at)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
