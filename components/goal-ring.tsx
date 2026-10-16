export function GoalRing({
  value,
  goal,
  size = 72,
}: {
  value: number;
  goal: number;
  size?: number;
}) {
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(1, value / goal);
  const done = value >= goal;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Daily goal: ${Math.min(value, goal)} of ${goal} votes`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={done ? "var(--yellow)" : "var(--primary)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)" }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-lg font-black">
        {done ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--yellow-dark)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7" />
          </svg>
        ) : (
          `${value}/${goal}`
        )}
      </span>
    </div>
  );
}
