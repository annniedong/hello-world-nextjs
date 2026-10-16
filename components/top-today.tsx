import Link from "next/link";
import { getTopCaptions } from "@/lib/queries";
import { photoUrl } from "@/lib/storage";
import { getViewer } from "@/lib/viewer";

export async function TopToday() {
  const { supabase } = await getViewer();

  const today = await getTopCaptions(supabase, { hours: 24, limit: 3 });
  const isToday = today.captions.length > 0;
  const { captions } = isToday
    ? today
    : await getTopCaptions(supabase, { hours: null, limit: 3 });

  if (captions.length === 0) return null;

  return (
    <section className="rounded-3xl border-2 border-border bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-black">
          {isToday ? "Top today" : "Top of all time"}
        </h2>
        <Link
          href="/top"
          className="text-xs font-extrabold uppercase tracking-wide text-blue hover:underline"
        >
          See all
        </Link>
      </div>
      <ol className="mt-3 flex flex-col gap-1.5">
        {captions.map((caption, index) => (
          <li key={caption.id}>
            <Link
              href={`/image/${caption.images.id}`}
              className="flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-surface-2"
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black ${
                  index === 0 ? "bg-yellow text-yellow-foreground" : "bg-surface-2 text-muted"
                }`}
              >
                {index + 1}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl(caption.images.storage_path)}
                alt=""
                loading="lazy"
                className="h-12 w-12 shrink-0 rounded-xl object-cover"
              />
              <span className="line-clamp-2 flex-1 text-sm font-bold leading-snug">
                {caption.content}
              </span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-black tabular-nums text-primary">
                {caption.score > 0 ? `+${caption.score}` : caption.score}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
