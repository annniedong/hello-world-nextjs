"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { castVote } from "@/app/actions/vote";
import { ArrowDownIcon, ArrowUpIcon } from "@/components/icons";
import { XP } from "@/lib/progress-calc";

type Vote = -1 | 0 | 1;

const target =
  "grid h-10 w-10 place-items-center rounded-xl transition-all duration-100 active:scale-90";
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
  const [burst, setBurst] = useState(0);
  const [optimistic, setOptimistic] = useOptimistic(
    { score, myVote },
    (state, next: Vote) => ({
      score: state.score - state.myVote + next,
      myVote: next,
    }),
  );

  function vote(value: 1 | -1) {
    const next: Vote = optimistic.myVote === value ? 0 : value;
    if (next !== 0 && optimistic.myVote === 0) setBurst((b) => b + 1);
    startTransition(async () => {
      setOptimistic(next);
      const result = await castVote(captionId, next);
      setError(result.error ?? null);
    });
  }

  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <div className="relative flex shrink-0 flex-col items-end gap-1">
      {burst > 0 && (
        <span
          key={burst}
          aria-hidden
          className="pointer-events-none absolute -top-6 right-2 animate-float-up whitespace-nowrap font-display text-sm font-black text-yellow-dark"
        >
          +{XP.vote} XP
        </span>
      )}

      <div className="flex items-center rounded-2xl border-2 border-border bg-surface-2 p-0.5">
        {signedIn ? (
          <button
            type="button"
            onClick={() => vote(1)}
            aria-label="Upvote: funny"
            aria-pressed={optimistic.myVote === 1}
            title="Funny"
            className={`${target} ${
              optimistic.myVote === 1
                ? "animate-pop bg-primary text-primary-foreground shadow-[0_3px_0_var(--primary-dark)]"
                : idle
            }`}
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
        ) : (
          <Link
            href={loginHref}
            aria-label="Sign in to upvote"
            title="Sign in to vote"
            className={`${target} ${idle}`}
          >
            <ArrowUpIcon className="h-5 w-5" />
          </Link>
        )}

        <span
          className="min-w-9 text-center font-display text-base font-black tabular-nums"
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
            className={`${target} ${
              optimistic.myVote === -1
                ? "animate-pop bg-danger text-white shadow-[0_3px_0_var(--danger-dark)]"
                : idle
            }`}
          >
            <ArrowDownIcon className="h-5 w-5" />
          </button>
        ) : (
          <Link
            href={loginHref}
            aria-label="Sign in to downvote"
            title="Sign in to vote"
            className={`${target} ${idle}`}
          >
            <ArrowDownIcon className="h-5 w-5" />
          </Link>
        )}
      </div>
      {error && (
        <span role="alert" className="max-w-32 text-right text-xs font-bold text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
