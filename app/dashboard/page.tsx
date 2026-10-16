import Link from "next/link";
import { redirect } from "next/navigation";
import { FlameIcon, PlusIcon, StarIcon } from "@/components/icons";
import { Pigeon } from "@/components/pigeon";
import { ProgressCard } from "@/components/progress-card";
import { photoUrl } from "@/lib/storage";
import { timeAgo } from "@/lib/time";
import { getViewerProgress } from "@/lib/progress";
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
  const progress = await getViewerProgress();
  const { data } = await supabase
    .from("images")
    .select("id, storage_path, created_at, captions(id, content, score, vote_count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const tiles = (data ?? []) as Tile[];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight">
            {profile?.first_name ? `${profile.first_name}'s photos` : "My photos"}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-bold text-muted">
            {progress && (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <FlameIcon className="h-5 w-5 text-orange" />
                  {progress.streak} day streak
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <StarIcon className="h-5 w-5 text-yellow-dark" />
                  {progress.xp} XP
                </span>
                <span>{progress.votesReceived} votes received</span>
              </>
            )}
          </p>
        </div>
        <Link href="/create" className={buttonClass("primary")}>
          <PlusIcon className="h-4 w-4" />
          Add photo
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <section aria-label="Your photos">
          {tiles.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-border p-10 text-center">
              <Pigeon size={110} />
              <p className="mt-2 font-display text-2xl font-black">No photos yet</p>
              <p className="mt-1 font-semibold text-muted">
                Add one and watch the votes come in.
              </p>
              <Link href="/create" className={`${buttonClass("primary", "lg")} mt-5`}>
                Add your first photo
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {tiles.map((tile) => {
                const best = [...tile.captions].sort((a, b) => b.score - a.score)[0];
                return (
                  <li key={tile.id}>
                    <Link
                      href={`/image/${tile.id}`}
                      className="block overflow-hidden rounded-3xl border-2 border-border bg-surface transition-transform hover:-translate-y-1"
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
                          <p className="line-clamp-2 text-sm font-bold leading-snug">
                            {best.content}
                          </p>
                        )}
                        <p className="mt-2 text-xs font-bold text-muted">
                          {best
                            ? `Best: ${best.score > 0 ? "+" : ""}${best.score}`
                            : "No captions"}{" "}
                          · {timeAgo(tile.created_at)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProgressCard />
        </aside>
      </div>
    </main>
  );
}
