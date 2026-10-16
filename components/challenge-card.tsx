import Link from "next/link";
import { CameraIcon } from "@/components/icons";
import { SubwayBullet } from "@/components/subway-bullet";
import { buttonClass } from "@/lib/ui";
import { todaysChallenge } from "@/lib/voices";

export function ChallengeCard() {
  return (
    <section className="overflow-hidden rounded-3xl border-2 border-border bg-surface">
      <div className="flex items-center gap-2.5 bg-night px-4 py-2.5 text-white">
        <SubwayBullet line="N" size={24} />
        <p className="text-xs font-black uppercase tracking-widest">
          Today&apos;s challenge
        </p>
      </div>
      <div className="p-5">
        <p className="font-display text-xl font-black leading-snug">
          {todaysChallenge()}
        </p>
        <Link href="/create" className={`${buttonClass("yellow")} mt-4`}>
          <CameraIcon className="h-4 w-4" />
          Take the challenge
        </Link>
      </div>
    </section>
  );
}
