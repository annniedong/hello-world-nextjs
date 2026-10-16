import Link from "next/link";
import { FlameIcon, StarIcon } from "@/components/icons";
import { GoalRing } from "@/components/goal-ring";
import { Pigeon } from "@/components/pigeon";
import { getViewerProgress } from "@/lib/progress";
import { buttonClass } from "@/lib/ui";

export function JoinCard() {
  return (
    <section className="flex items-center gap-4 rounded-3xl border-2 border-border bg-surface p-5">
      <Pigeon size={72} bobbing />
      <div className="flex flex-1 flex-col items-start gap-2">
        <p className="font-display text-lg font-black leading-tight">
          Start your streak
        </p>
        <Link href="/login" className={buttonClass("primary")}>
          Join free
        </Link>
      </div>
    </section>
  );
}

export async function ProgressCard() {
  const progress = await getViewerProgress();
  if (!progress) return <JoinCard />;

  const {
    votesToday,
    goal,
    streak,
    streakAlive,
    xp,
    levelIndex,
    levelName,
    nextLevelName,
    levelFloor,
    levelCeiling,
  } = progress;

  const goalDone = votesToday >= goal;
  const levelPct =
    levelCeiling === null
      ? 100
      : Math.round(((xp - levelFloor) / (levelCeiling - levelFloor)) * 100);

  return (
    <section className="rounded-3xl border-2 border-border bg-surface p-5">
      <div className="flex items-center gap-4">
        <GoalRing value={votesToday} goal={goal} />
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-muted">
            Daily goal
          </p>
          <p className="font-display text-xl font-black leading-tight">
            {goalDone ? "Goal complete!" : `${goal - votesToday} to go`}
          </p>
          <p className="text-sm font-semibold text-muted">
            {votesToday} of {goal} votes today
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-border bg-background p-3">
          <p className="flex items-center gap-1.5 font-display text-2xl font-black">
            <FlameIcon
              className={`h-6 w-6 ${streakAlive ? "text-orange" : "text-line-gray"}`}
            />
            {streak}
          </p>
          <p className="text-xs font-bold text-muted">
            {streak === 1 ? "day streak" : "day streak"}
            {!streakAlive && streak > 0 ? " (at risk)" : ""}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-border bg-background p-3">
          <p className="flex items-center gap-1.5 font-display text-2xl font-black">
            <StarIcon className="h-6 w-6 text-yellow-dark" />
            {xp}
          </p>
          <p className="text-xs font-bold text-muted">total XP</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-extrabold">
            Level {levelIndex + 1} · {levelName}
          </p>
          {nextLevelName && levelCeiling !== null && (
            <p className="text-xs font-bold text-muted">
              {levelCeiling - xp} XP to {nextLevelName}
            </p>
          )}
        </div>
        <div className="mt-1.5 h-3.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-yellow transition-[width] duration-700 ease-out"
            style={{ width: `${levelPct}%` }}
          />
        </div>
      </div>

      {!goalDone && (
        <Link href="/vote" className={`${buttonClass("primary")} mt-4 w-full`}>
          Rate photos
        </Link>
      )}
    </section>
  );
}
