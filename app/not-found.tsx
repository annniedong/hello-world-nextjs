import Link from "next/link";
import { Pigeon } from "@/components/pigeon";
import { buttonClass } from "@/lib/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <Pigeon size={110} />
      <h1 className="mt-3 font-display text-4xl font-black">Wrong train</h1>
      <p className="mt-2 font-semibold text-muted">
        We couldn&apos;t find that page. The link may be off by a character.
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
