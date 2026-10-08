import Link from "next/link";
import { VoteButtons } from "@/components/vote-buttons";
import { photoUrl } from "@/lib/storage";
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
  const voiceLabel = captions[0] && getVoice(captions[0].style)?.label;

  const photo = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl(image.storage_path)}
      alt="A photo shared on NYC Captions"
      loading="lazy"
      className="aspect-[4/3] w-full bg-zinc-100 object-cover dark:bg-zinc-900"
    />
  );

  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      {linkToPage ? <Link href={`/image/${image.id}`}>{photo}</Link> : photo}
      <div className="flex flex-col gap-1 p-2">
        {voiceLabel && (
          <p className="px-2 pt-1 text-xs uppercase tracking-wide text-zinc-500">
            {voiceLabel}
          </p>
        )}
        <ul className="flex flex-col">
          {captions.map((caption) => (
            <li key={caption.id} className="flex items-center gap-3 p-2">
              <VoteButtons
                captionId={caption.id}
                score={caption.score}
                myVote={myVotes.get(caption.id) ?? 0}
                signedIn={signedIn}
              />
              <p className="flex-1">{caption.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
