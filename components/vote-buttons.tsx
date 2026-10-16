"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { castVote } from "@/app/actions/vote";
import { ArrowDownIcon, ArrowUpIcon } from "@/components/icons";

type Vote = -1 | 0 | 1;

const target =
  "grid h-9 w-9 place-items-center rounded-full transition-colors";
const idle = "text-muted hover:bg-border hover:text-foreground";

export function VoteButtons({
  captionId,
  score,
  myVote,
  signedIn,
}: {
  captionId: string;
  score: number;
  myVote: Vote;
  signedIn: boolean;
}) {
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useOptimistic(
    { score, myVote },
    (state, next: Vote) => ({
      score: state.score - state.myVote + next,
      myVote: next,
    }),
  );

  function vote(value: 1 | -1) {
    const next: Vote = optimistic.myVote === value ? 0 : value;
    startTransition(async () => {
      setOptimistic(next);
      const result = await castVote(captionId, next);
      setError(result.error ?? null);
    });
  }

  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex items-center rounded-full border border-border bg-surface-2 p-0.5">
        {signedIn ? (
          <button
            type="button"
            onClick={() => vote(1)}
            aria-label="Upvote: funny"
            aria-pressed={optimistic.myVote === 1}
            title="Funny"
            className={`${target} ${optimistic.myVote === 1 ? "bg-up text-background" : idle}`}
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
        ) : (
          <Link
            href={loginHref}
            aria-label="Sign in to upvote"
            title="Sign in to vote"
            className={`${target} ${idle}`}
          >
            <ArrowUpIcon className="h-4 w-4" />
          </Link>
        )}

        <span
          className="min-w-8 text-center text-sm font-semibold tabular-nums"
          aria-label={`Score ${signedIn ? optimistic.score : score}`}
        >
          {signedIn ? optimistic.score : score}
        </span>

        {signedIn ? (
          <button
            type="button"
            onClick={() => vote(-1)}
            aria-label="Downvote: not funny"
            aria-pressed={optimistic.myVote === -1}
            title="Not funny"
            className={`${target} ${optimistic.myVote === -1 ? "bg-down text-background" : idle}`}
          >
            <ArrowDownIcon className="h-4 w-4" />
          </button>
        ) : (
          <Link
            href={loginHref}
            aria-label="Sign in to downvote"
            title="Sign in to vote"
            className={`${target} ${idle}`}
          >
            <ArrowDownIcon className="h-4 w-4" />
          </Link>
        )}
      </div>
      {error && (
        <span role="alert" className="max-w-32 text-right text-xs text-down">
          {error}
        </span>
      )}
    </div>
  );
}
