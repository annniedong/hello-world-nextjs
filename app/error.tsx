"use client";

import Link from "next/link";
import { buttonClass } from "@/lib/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 text-center sm:px-6">
      <h1 className="font-display text-3xl font-bold">Something broke</h1>
      <p className="mt-2 text-muted">
        That one&apos;s on us. Try again, or head back to the feed.
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
