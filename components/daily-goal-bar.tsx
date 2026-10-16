import { Confetti } from "@/components/confetti";
import { FlameIcon } from "@/components/icons";

export function DailyGoalBar({
  votesToday,
  goal,
}: {
  votesToday: number;
  goal: number;
}) {
  const pct = Math.min(100, Math.round((votesToday / goal) * 100));
  const done = votesToday >= goal;

  return (
    <div className="mb-5 rounded-2xl border-2 border-border bg-surface p-4">
      {votesToday === goal && <Confetti />}
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-extrabold">
          <FlameIcon className={`h-5 w-5 ${done ? "text-orange" : "text-line-gray"}`} />
          {done ? "Daily goal complete! Keep going for bonus XP." : "Daily goal"}
        </p>
        <p className="text-sm font-black tabular-nums">
          {Math.min(votesToday, goal)}/{goal}
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={Math.min(votesToday, goal)}
        aria-label="Daily rating goal"
        className="mt-2 h-3.5 overflow-hidden rounded-full bg-surface-2"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${
            done ? "bg-yellow" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
