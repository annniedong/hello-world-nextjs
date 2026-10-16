import Link from "next/link";
import { buttonClass } from "@/lib/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 text-center sm:px-6">
      <h1 className="font-display text-3xl font-bold">Couldn&apos;t find that</h1>
      <p className="mt-2 text-muted">
        The photo may have moved, or the link is off by a character.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className={buttonClass("primary", "lg")}>
          Back to the feed
        </Link>
        <Link href="/vote" className={buttonClass("secondary", "lg")}>
          Rate photos
        </Link>
      </div>
    </main>
  );
}
