import Link from "next/link";
import { SubwayBullet } from "@/components/subway-bullet";
import { VoteButtons } from "@/components/vote-buttons";
import { photoUrl } from "@/lib/storage";
import { timeAgo } from "@/lib/time";
import { getVoice } from "@/lib/voices";
import type { MyVotes } from "@/lib/votes";

export type CardCaption = {
  id: string;
  content: string;
  score: number;
  style: string;
};

export type CardImage = {
  id: string;
  storage_path: string;
  created_at: string;
  captions: CardCaption[];
};

export function ImageCard({
  image,
  myVotes,
  signedIn,
  linkToPage = true,
}: {
  image: CardImage;
  myVotes: MyVotes;
  signedIn: boolean;
  linkToPage?: boolean;
}) {
  // Stable order (not by score) so the vote buttons don't jump under the cursor.
  const captions = [...image.captions].sort((a, b) => a.id.localeCompare(b.id));
  const voice = captions[0] ? getVoice(captions[0].style) : undefined;

  const photo = (
    <div className="bg-surface-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl(image.storage_path)}
        alt="A photo shared on NYC Captions"
        loading="lazy"
        className="mx-auto block max-h-[34rem] min-h-48 w-full object-contain"
      />
    </div>
  );

  return (
    <article className="overflow-hidden rounded-3xl border-2 border-border bg-surface">
      {linkToPage ? (
        <Link href={`/image/${image.id}`} aria-label="Open this photo">
          {photo}
        </Link>
      ) : (
        photo
      )}

      <div className="flex items-center justify-between gap-3 px-4 pt-4 text-xs font-bold text-muted">
        {voice ? (
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-background py-1 pl-1 pr-3 text-foreground">
            <SubwayBullet line={voice.line} size={22} />
            <span className="text-xs font-extrabold">{voice.label}</span>
          </span>
        ) : (
          <span />
        )}
        <time dateTime={image.created_at}>{timeAgo(image.created_at)}</time>
      </div>

      <ul className="mt-1 divide-y-2 divide-border">
        {captions.map((caption) => (
          <li key={caption.id} className="flex items-center gap-4 px-4 py-4">
            <p className="flex-1 text-[17px] font-bold leading-snug">
              {caption.content}
            </p>
            <VoteButtons
              captionId={caption.id}
              score={caption.score}
              myVote={myVotes.get(caption.id) ?? 0}
              signedIn={signedIn}
            />
          </li>
        ))}
      </ul>
    </article>
  );
}
