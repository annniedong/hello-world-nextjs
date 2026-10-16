export const LEVELS = [
  { name: "Tourist", min: 0 },
  { name: "Commuter", min: 40 },
  { name: "Straphanger", min: 120 },
  { name: "Regular", min: 260 },
  { name: "Local", min: 480 },
  { name: "Lifelong New Yorker", min: 800 },
] as const;

const XP_PER_VOTE = 5;
const XP_PER_PHOTO = 15;
const XP_PER_VOTE_RECEIVED = 3;

export const XP = {
  vote: XP_PER_VOTE,
  photo: XP_PER_PHOTO,
  received: XP_PER_VOTE_RECEIVED,
};

export type Progress = {
  xp: number;
  levelIndex: number;
  levelName: string;
  nextLevelName: string | null;
  levelFloor: number;
  levelCeiling: number | null;
  streak: number;
  streakAlive: boolean;
  votesToday: number;
  goal: number;
  photos: number;
  votesCast: number;
  votesReceived: number;
};

function nyDay(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function shiftDay(day: string, delta: number): string {
  const shifted = new Date(Date.parse(day) + delta * 86_400_000);
  return shifted.toISOString().slice(0, 10);
}

export function computeProgress(args: {
  voteDates: string[];
  photoDates: string[];
  votesReceived: number;
  goal: number;
  now?: Date;
}): Progress {
  const { voteDates, photoDates, votesReceived, goal } = args;
  const today = nyDay(args.now ?? new Date());

  const activeDays = new Set<string>();
  let votesToday = 0;
  for (const iso of voteDates) {
    const day = nyDay(new Date(iso));
    activeDays.add(day);
    if (day === today) votesToday += 1;
  }
  for (const iso of photoDates) activeDays.add(nyDay(new Date(iso)));

  // The streak survives until the end of today even if today is still empty.
  const doneToday = activeDays.has(today);
  let cursor = doneToday ? today : shiftDay(today, -1);
  let streak = 0;
  while (activeDays.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }

  const xp =
    voteDates.length * XP_PER_VOTE +
    photoDates.length * XP_PER_PHOTO +
    votesReceived * XP_PER_VOTE_RECEIVED;

  let levelIndex = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) levelIndex = i;
  }
  const next = LEVELS[levelIndex + 1];

  return {
    xp,
    levelIndex,
    levelName: LEVELS[levelIndex].name,
    nextLevelName: next?.name ?? null,
    levelFloor: LEVELS[levelIndex].min,
    levelCeiling: next?.min ?? null,
    streak,
    streakAlive: doneToday,
    votesToday,
    goal,
    photos: photoDates.length,
    votesCast: voteDates.length,
    votesReceived,
  };
}
