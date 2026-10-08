"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { castVote } from "@/app/actions/vote";

type Vote = -1 | 0 | 1;

const arrow =
  "flex h-8 w-8 items-center justify-center rounded text-sm transition-colors";

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

  if (!signedIn) {
    return (
      <div className="flex flex-col items-center">
        <Link
          href="/login"
          title="Sign in to vote"
          aria-label="Sign in to upvote"
          className={`${arrow} text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800`}
        >
          ▲
        </Link>
        <span className="text-sm font-medium tabular-nums">{score}</span>
        <Link
          href="/login"
          title="Sign in to vote"
          aria-label="Sign in to downvote"
          className={`${arrow} text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800`}
        >
          ▼
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => vote(1)}
        aria-label="Upvote"
        aria-pressed={optimistic.myVote === 1}
        className={`${arrow} ${
          optimistic.myVote === 1
            ? "bg-emerald-600 text-white"
            : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`}
      >
        ▲
      </button>
      <span className="text-sm font-medium tabular-nums">
        {optimistic.score}
      </span>
      <button
        type="button"
        onClick={() => vote(-1)}
        aria-label="Downvote"
        aria-pressed={optimistic.myVote === -1}
        className={`${arrow} ${
          optimistic.myVote === -1
            ? "bg-rose-600 text-white"
            : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`}
      >
        ▼
      </button>
      {error && (
        <span role="alert" className="mt-1 max-w-24 text-center text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
