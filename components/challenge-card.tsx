import Link from "next/link";
import { CameraIcon } from "@/components/icons";
import { buttonClass } from "@/lib/ui";
import { todaysChallenge } from "@/lib/voices";

export function ChallengeCard() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
        <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
        Today&apos;s challenge
      </p>
      <p className="mt-2 font-display text-xl font-bold leading-snug">
        {todaysChallenge()}
      </p>
      <Link href="/create" className={`${buttonClass("primary")} mt-4`}>
        <CameraIcon className="h-4 w-4" />
        Take the challenge
      </Link>
    </section>
  );
}
