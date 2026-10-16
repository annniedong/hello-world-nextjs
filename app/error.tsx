"use client";

import Link from "next/link";
import { Pigeon } from "@/components/pigeon";
import { buttonClass } from "@/lib/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <Pigeon size={110} />
      <h1 className="mt-3 font-display text-4xl font-black">Service delay</h1>
      <p className="mt-2 font-semibold text-muted">
        Something on our end hit a snag. Try again, or head back to the feed.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={reset} className={buttonClass("primary", "lg")}>
          Try again
        </button>
        <Link href="/" className={buttonClass("secondary", "lg")}>
          Go home
        </Link>
      </div>
    </main>
  );
}
