import Link from "next/link";
import { FlameIcon } from "@/components/icons";
import { getViewerProgress } from "@/lib/progress";

export async function StreakChip() {
  const progress = await getViewerProgress();
  if (!progress) return null;

  const { streak, streakAlive } = progress;
  const label = streakAlive
    ? `${streak} day streak. You're safe for today.`
    : streak > 0
      ? `${streak} day streak. Rate a photo today to keep it.`
      : "Rate a photo to start a streak.";

  return (
    <Link
      href="/dashboard"
      title={label}
      aria-label={label}
      className="flex h-10 items-center gap-1.5 rounded-xl px-2.5 font-display text-base font-black transition-colors hover:bg-surface-2"
    >
      <FlameIcon
        className={`h-6 w-6 ${streakAlive ? "text-orange" : "text-line-gray"}`}
      />
      <span className={streakAlive ? "text-orange" : "text-line-gray"}>{streak}</span>
    </Link>
  );
}
